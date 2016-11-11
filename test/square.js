var Node = require('../index.js');
var Graph = require('./helpers/graph.js');
var assert = require('assert');

describe('Four nodes', function() {
  var graph;
  beforeEach(function() {
    graph = new Graph({
      a: new Node(),
      b: new Node(),
      c: new Node(),
      d: new Node(),
    });
    graph.connect('a', 'b');
    graph.connect('b', 'c');
    graph.connect('c', 'd');
    graph.connect('d', 'a');
    return graph.propagate();
  });

  it('should find a cycle', function() {
    assert.deepEqual(graph.nodes.a.getActiveNeighbors(), {
      'in': ['d'],
      out: ['b'],
    });
    assert.deepEqual(graph.nodes.b.getActiveNeighbors(), {
      'in': ['a'],
      out: ['c'],
    });
    assert.deepEqual(graph.nodes.c.getActiveNeighbors(), {
      'in': ['b'],
      out: ['d'],
    });
    assert.deepEqual(graph.nodes.d.getActiveNeighbors(), {
      'in': ['c'],
      out: ['a'],
    });
  });
  describe('incoming probe message for a', function() {
    beforeEach(function() {
      graph.nodes.a.handleProbeMessage('c', 'in', {
        treeToken: 'asdf',
      });
      return graph.propagate();
    });
    it('should find a route', function() {
      assert.equal(graph.nodes.a._cycleFound, true);
    });
  });
});
