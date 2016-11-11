var randomstring = require('randomstring');

function generateNewPathToken() {
  return randomstring.generate(40);
}

function Route(inNeighbor, treeToken) {
  this._inNeighbor = inNeighbor;
  this._treeToken = treeToken;
  this._outNeighbors = {
  };
  this._backtracked = false;
}

Route.prototype.getNextSiblingToTry = function(outNeighborIds) {
  for (var i=0; i<outNeighborIds.length; i++) {
    if (typeof this._outNeighbors[outNeighborIds[i]] === 'undefined') {
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

Route.prototype.markBacktracked = function() {
  this._backtracked = true;
};

Route.prototype.wasBacktracked = function() {
  return this._backtracked;
};

module.exports = Route;
