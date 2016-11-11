var Neighbor = require('./neighbor');
var Route = require('./route');

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
  this._cycleFound = false;
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

Node.prototype._probeIsKnown = function(treeToken) {
  return (typeof this._routes[treeToken] !== 'undefined');
};

Node.prototype.handleProbeMessage = function(neighborId, direction, msgObj) {
  if (direction === 'in') {
    if (this._probeIsKnown(msgObj.treeToken)) {
      if (this._routes[msgObj.treeToken].wasBacktracked()) {
        //cross-edge, backtrack again
        this._neighbors['in'][neighborId].sendProbeMessage(msgObj);
      } else {
        this._cycleFound = true;
      }
      return;
    }
    this._routes[msgObj.treeToken] = new Route(neighborId, msgObj.treeToken, msgObj.pathToken);
    var firstOutNeighborId = this._routes[msgObj.treeToken].getNextSiblingToTry(this.getActiveNeighbors().out);
    if (firstOutNeighborId) {
      this._neighbors.out[firstOutNeighborId].sendProbeMessage(msgObj);
    } else { // backtrack
      this._routes[msgObj.treeToken].markBacktracked();
      this._neighbors['in'][neighborId].sendProbeMessage(msgObj);
    }
  } else {
    var nextOutNeighborId = this._routes[msgObj.treeToken].getNextSiblingToTry(this.getActiveNeighbors().out);
    if (nextOutNeighborId) {
      msgObj.pathToken = this._routes[msgObj.treeToken].getPathToken();
      this._neighbors.out[nextOutNeighborId].sendProbeMessage(msgObj);
    } else { // backtrack
      this._routes[msgObj.treeToken].markBacktracked();
      this._neighbors['in'][neighborId].sendProbeMessage(msgObj);
    }
  }
};

Node.prototype.handleStatusMessage = function(neighborId, direction, msgObj) {
  var now = new Date().getTime();
  if (msgObj.timestamp > now) {
    msgObj.timestamp = now;
  }

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
