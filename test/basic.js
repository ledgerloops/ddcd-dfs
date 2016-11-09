var Node = require('../index.js');

var assert = require('assert');

describe('Node', function() {
  var node;
  beforeEach(function() {
    node = new Node();
  });

  it('should add a link', function() {
    assert.equal(typeof node.addLink, 'function');
  });
});
