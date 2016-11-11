function Graph(nodes) {
  this._msgQueue = [];
  this.nodes = nodes;
  this._log = [];
};

Graph.prototype.propagate = function() {
  if (this._msgQueue.length === 0) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    var args = this._msgQueue.shift();
    if (args[3].msgType === 'probe') {
      this.nodes[args[0]].handleProbeMessage(args[1], args[2], args[3]);
    } else {
      this.nodes[args[0]].handleStatusMessage(args[1], args[2], args[3]);
    }
    // FIXME: not sure why this setTimeout 0 between messages is necessary,
    // see https://github.com/ledgerloops/ddcd-dfs/issues/3
    setTimeout(() => this.propagate().then(resolve), 0);
    // this.propagate().then(resolve);
  });
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
