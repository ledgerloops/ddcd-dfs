var randomstring = require('randomstring');

function generateNewToken() {
  return randomstring.generate(40);
}

function Route(inNeighbor, treeToken) {
  this._inNeighbor = inNeighbor;
  this._treeToken = treeToken;
  this._outNeighbors = {
  };
  this._backtracked = false;
}

Route.generateTreeToken = generateNewToken;

Route.prototype.getNextSiblingToTry = function(outNeighborIds) {
  for (var i=0; i<outNeighborIds.length; i++) {
    if (typeof this._outNeighbors[outNeighborIds[i]] === 'undefined') {
      this._outNeighbors[outNeighborIds[i]] = generateNewToken();
      return outNeighborIds[i];
    }
  }
};

Route.prototype.getPathToken = function(outNeighborId) {
  return this._outNeighbors[outNeighborId];
};

Route.prototype.getOutNeighborId = function(pathToken) {
  for (var outNeighborId in this._outNeighbors) {
    if (this._outNeighbors[outNeighborId] === pathToken) {
      return outNeighborId;
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
