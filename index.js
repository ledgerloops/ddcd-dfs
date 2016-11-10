function Neighbor(msgCallback) {
  this._msgCallback = msgCallback;
  this._theirLastMsg = {
    timestamp: 0,
  };
  this._ourLastMsg = {
    timestamp: 0,
  };
}

Neighbor.prototype.sendStatusMessage = function(value, timestamp) {
  if (this._ourLastMsg.value === value) {
    return 0;
  }
  if (this._ourLastMsg.timestamp > timestamp) {
    return 0;
  }
  this._ourLastMsg = {
    value,
    timestamp,
  };
  this._msgCallback(this._ourLastMsg);
  return 1;
};

Neighbor.prototype.sendProbeMessage = function(msgObj) {
  this._msgCallback(msgObj);
};

Neighbor.prototype.saveStatusMessage = function(msgObj) {
  this._theirLastMsg = msgObj;
};

function Route(inNeighbor, treeToken) {
  this._inNeighbor = inNeighbor;
  this._treeToken = treeToken;
  this._outNeighbors = {
  };
}

Route.prototype.getNextSiblingToTry = function(outNeighborIds) {
  for (var i=0; i<outNeighborIds.length; i++) {
    if (typeof this._outNeigbors[outNeighborIds[i]] === 'undefined') {
      this._outNeighbors[outNeighborIds[i]] = generateNewPathToken();
      return outNeighborIds[i];
    }
  }
};

Route.prototype.getOutNeighborNick = function(pathToken) {
  for (var outNeighborNick in this._outNeighbors) {
    if (this._outNeighbors[outNeighborNick] === pathToken) {
      return outNeighborNick;
    }
  }
};

var OPPOSITE = {
  'in': 'out',
  out: 'in',
};

function Node() {
  this._neighbors = {
    'in': {},
    out: {},
  };
  this._routes = {};
  this._lastTimestampGenerated = 0;
}

Node.prototype._getTimestamp = function() {
  var candidate = new Date().getTime();
  if (candidate <= this._lastTimestampGenerated) {
    candidate++;
  }
  this._lastTimestampGenerated = candidate;
  return candidate;
};

Node.prototype._noActiveNeighborsLeft = function(direction) {
  for (var neighborId in this._neighbors[direction]) {
    if (this._neighbors[direction][neighborId]._theirLastMsg.value === true) {
      return false;
    }
  }
  return true;
};

Node.prototype._startWave = function(direction, value, timestamp) {
  var numTried = 0;
  var numSent = 0;
  for (var neighborId in this._neighbors[direction]) {
    numTried++;
    numSent += this._neighbors[direction][neighborId].sendStatusMessage(value, timestamp);
  }
  if (value === false) {
    return; // no back wave
  }
  if (numTried === 0) { // bounce against edge of network
    return {
      value: false,
      timestamp,
     };
  }
  if (numSent === 0) { // special case, reply true
    return {
      value: true,
      timestamp,
    };
  }
};

Node.prototype._activate = function(direction, timestamp) {
  var msgBack  = this._startWave(direction, true, timestamp);
  if (typeof msgBack === 'object') {
    this._startWave(OPPOSITE[direction], msgBack.value, msgBack.timestamp);
  }
};

Node.prototype.addNeighbor = function(neighborId, direction, msgCallback) {
  if (typeof this._neighbors[direction][neighborId] === 'undefined') {
    this._neighbors[direction][neighborId] = new Neighbor(msgCallback);
    this._activate(OPPOSITE[direction], this._getTimestamp());
  }
};

Node.prototype.removeNeighbor = function(neighborId, direction) {
  delete this._neighbors[direction][neighborId];
  if (this._noNeighborsLeft(direction)) {
    this._startWave(OPPOSITE[direction], false, this._getTimestamp());
  }
};

Node.prototype.handleProbeMessage = function(neighborId, direction, msgObj) {
  if (direction === 'in') {
    this._routes[msgObj.treeToken] = new Route(neighborId, msgObj.treeToken, msgObj.pathToken);
    var firstOutNeighborId = this._routes[msgObj.treeToken].getNextSiblingToTry(this.getActiveNeighbors().out);
    if (firstOutNeighborId) {
      this._neighbors.out[firstOutNeighborId].sendProbeMessage(msgObj);
    } else { // backtrack
      this._neighbors['in'][neighborId].sendProbeMessage(msgObj);
    }
  } else {
    var nextOutNeighborId = this._routes[msgObj.treeToken].getNextSiblingToTry(this.getActiveNeighbors().out);
    if (nextOutNeighborId) {
      msgObj.pathToken = this._routes[msgObj.treeToken].getPathToken();
      this._neighbors.out[nextOutNeighborId].sendProbeMessage(msgObj);
    } else { // backtrack
      this._neighbors['in'][neighborId].sendProbeMessage(msgObj);
    }
  }
};

Node.prototype.handleStatusMessage = function(neighborId, direction, msgObj) {
  this._neighbors[direction][neighborId].saveStatusMessage(msgObj);

  if (msgObj.value === true) {
    this._activate(OPPOSITE[direction], msgObj.timestamp);
  }

  if (msgObj.value === false && this._noActiveNeighborsLeft(direction)) {
    this._startWave(OPPOSITE[direction], false, msgObj.timestamp);
  }
};

Node.prototype.getActiveNeighbors = function() {
  var ret = {
    'in': [],
    out: [],
  };
  ['in', 'out'].map(direction => {
    for (var neighborId in this._neighbors[direction]) {
      if (this._neighbors[direction][neighborId]._theirLastMsg.value === true) {
        ret[direction].push(neighborId);
      }
    }
  });
  return ret;
};

Node.prototype.getPeerPair = function(treeToken, pathToken, inNeighborNick) {
  var route = this._routes[treeToken];
  return {
    inNeighborNick: inNeighborNick,
    outNeighborNick: this._routes[treeToken].getOutNeighborNick(pathToken),
  };
};

module.exports = Node;
