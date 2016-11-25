var Node = require('../index.js');

var assert = require('assert');
var sinon = require('sinon');

describe('Add out-neighbor, then in-neighbor', function() {
  var node;
  var inSpy;
  var outSpy;
  beforeEach(function() {
    node = new Node();
    inSpy = sinon.spy();
    outSpy = sinon.spy();
    node.addNeighbor('b', 'out', outSpy);
    node.addNeighbor('a', 'in', inSpy);
  });

  it('should start probe to out-neighbor', function() {
    assert.deepEqual(inSpy.args, []);
    assert.deepEqual(outSpy.args, [[{
      protocol: 'ddcd-dfs-0.3',
      msgType: 'probe',
      routeId: 'new-hash',
    }]]);
  });
});
