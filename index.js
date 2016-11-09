function Neighbor(msgCallback) {
  this._msgCallback = msgCallback;
  this._theirLastMsg = {};
  this._ourLastMsg = {};
}

Neighbor.prototype.sendMessage = function(value) {
  if (this._ourLastMsg.value === value) {
    return 1;
  }
  this._ourLastMsg = { value: value };
  this._msgCallback(this._ourLastMsg);
  return 1;
};

Neighbor.prototype.saveMessage = function(msgObj) {
  this._theirLastMsg = msgObj;
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
  var numSent = 0;
  for (var neighborId in this._neighbors[direction]) {
    numSent += this._neighbors[direction][neighborId].sendMessage(value);
  }
  return numSent;
};

Node.prototype.addNeighbor = function(neighborId, direction, msgCallback) {
  if (typeof this._neighbors[direction][neighborId] === 'undefined') {
    this._neighbors[direction][neighborId] = new Neighbor(msgCallback);
    var numSent  = this._startWave(OPPOSITE[direction], true);
    if (numSent === 0) { // bounce against edge of network
      this._startWave(direction, false);
    }     
  }
};

Node.prototype.removeNeighbor = function(neighborId, direction) {
  delete this._neighbors[direction][neighborId];
  if (this._noNeighborsLeft(direction)) {
    this._startWave(OPPOSITE[direction], false);
  }
};

Node.prototype.handleMessage = function(neighborId, direction, msgObj) {
  if (msgObj.value === false && this._noActiveNeighborsLeft(direction)) {
    this._startWave(OPPOSITE[direction], false);
  }
  this._neighbors[direction][neighborId].saveMessage(msgObj);
};

module.exports = Node;
