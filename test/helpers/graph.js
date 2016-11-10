function Graph(nodes) {
  this._msgQueue = [];
  this.nodes = nodes;
};

Graph.prototype.propagate = function() {
  while (this._msgQueue.length) {
    var args = this._msgQueue.shift();
    if (args[3].msgType === 'probe') {
      this.nodes[args[0]].handleProbeMessage(args[1], args[2], args[3]);
    } else {
      this.nodes[args[0]].handleStatusMessage(args[1], args[2], args[3]);
    }
  }
};

Graph.prototype.connect = function(from, to) {
  var that = this;
  this.nodes[from].addNeighbor(to, 'out', function(msgObj) {
    that._msgQueue.push([ to, from, 'in', msgObj ]);
  });
  this.nodes[to].addNeighbor(from, 'in', function(msgObj) {
    that._msgQueue.push([ from, to, 'out', msgObj ]);
  });
};

module.exports = Graph;
