function Neighbor(msgCallback) {
  this._msgCallback = msgCallback;
  this._theirLastMsg = {};
  this._ourLastMsg = {};
}

Neighbor.prototype.sendStatusMessage = function(value) {
  if (this._ourLastMsg.value === value) {
    return 0;
  }
  this._ourLastMsg = { value: value };
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
};

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
}

Node.prototype._noActiveNeighborsLeft = function(direction) {
  for (var neighborId in this._neighbors[direction]) {
    if (this._neighbors[direction][neighborId]._theirLastMsg.value === true) {
      return false;
    }
  }
  return true;
};

Node.prototype._startWave = function(direction, value) {
  var numTried = 0;
  var numSent = 0;
  for (var neighborId in this._neighbors[direction]) {
    numTried++;
    numSent += this._neighbors[direction][neighborId].sendStatusMessage(value);
  }
  if (value === false) {
    return; // no back wave
  }
  if (numTried === 0) { // bounce against edge of network
    return false;
  }
  if (numSent === 0) { // special case, reply true
    return true;
  }
};

Node.prototype._activate = function(direction) {
  var msgBack  = this._startWave(direction, true);
  if (typeof msgBack === 'boolean') {
    this._startWave(OPPOSITE[direction], msgBack);
  }
};

Node.prototype.addNeighbor = function(neighborId, direction, msgCallback) {
  if (typeof this._neighbors[direction][neighborId] === 'undefined') {
    this._neighbors[direction][neighborId] = new Neighbor(msgCallback);
    this._activate(OPPOSITE[direction]);
  }
};

Node.prototype.removeNeighbor = function(neighborId, direction) {
  delete this._neighbors[direction][neighborId];
  if (this._noNeighborsLeft(direction)) {
    this._startWave(OPPOSITE[direction], false);
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
    this._activate(OPPOSITE[direction]);
  }

  if (msgObj.value === false && this._noActiveNeighborsLeft(direction)) {
    this._startWave(OPPOSITE[direction], false);
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
