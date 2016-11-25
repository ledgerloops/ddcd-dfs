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
  this._cycleFound = false;
}

Node.prototype._pickOutNeighbor = function() {
  for (var id in this._neighbors.out) {
    return id;
  }
};

Node.prototype._startProbe = function(neighborIdIn, neighborIdOut) {
  var routeId = 'new-hash';
  this._routes[routeId] = {
    neighborIdIn,
    neighborIdOut,
  };
  this._neighbors.out[neighborIdOut].sendProbeMessage(routeId, 'probe');
};

Node.prototype.addNeighbor = function(neighborId, direction, msgCallback) {
  if (typeof this._neighbors[direction][neighborId] === 'undefined') {
    this._neighbors[direction][neighborId] = new Neighbor(msgCallback);
    if (direction === 'in') {
      var outNeighborId = this._pickOutNeighbor();
      if (outNeighborId) {
        this._startProbe(neighborId, outNeighborId);
      }
    }
  }
};

Node.prototype.removeNeighbor = function(neighborId, direction) {
  delete this._neighbors[direction][neighborId];
};

module.exports = Node;
