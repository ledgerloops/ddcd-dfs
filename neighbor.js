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
    msgType: 'status',
    value,
    timestamp,
  };
  this._msgCallback(this._ourLastMsg);
  return 1;
};

Neighbor.prototype.sendProbeMessage = function(msgObj) {
  msgObj.msgType = 'probe';
  this._msgCallback(msgObj);
};

Neighbor.prototype.saveStatusMessage = function(msgObj) {
  this._theirLastMsg = msgObj;
};

module.exports = Neighbor;
