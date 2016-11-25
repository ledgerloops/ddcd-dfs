function Neighbor(msgCallback) {
  this._msgCallback = msgCallback;
}

Neighbor.prototype.sendProbeMessage = function(routeId, msgType) {
  this._msgCallback({
    protocol: 'ddcd-dfs-0.3',
    msgType,
    routeId,
  });
};

module.exports = Neighbor;
