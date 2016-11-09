var Node = require('../index.js');

var assert = require('assert');

describe('Node', function() {
  var node;
  beforeEach(function() {
    node = new Node();
  });

  it('should add a neighbor', function() {
    assert.equal(typeof node.addNeighbor, 'function');
  });
});
