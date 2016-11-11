var Node = require('../index.js');
var Graph = require('./helpers/graph.js');
var assert = require('assert');

describe('Three nodes', function() {
  var graph;

  beforeEach(function() {
    graph = new Graph({
      a: new Node(),
      b: new Node(),
      c: new Node(),
    });
    graph.connect('a', 'b');
    graph.connect('b', 'c');
    graph.connect('c', 'a');

    return graph.propagate();
  });

  it('should find a cycle', function() {
    //setTimeout(function() {
      assert.deepEqual(graph.nodes.a.getActiveNeighbors(), {
        'in': ['c'],
        out: ['b'],
      });
      assert.deepEqual(graph.nodes.b.getActiveNeighbors(), {
        'in': ['a'],
        out: ['c'],
      });
      assert.deepEqual(graph.nodes.c.getActiveNeighbors(), {
        'in': ['b'],
        out: ['a'],
      });
    //}, 100);
  });
  describe('incoming probe message for a', function() {
    beforeEach(function() {
      graph.nodes.a.handleProbeMessage('c', 'in', {
        treeToken: 'asdf',
      });
      return graph.propagate();
    });
    it('a should find a route', function() {
      assert.equal(graph.nodes.a._cycleFound, true);
    });
    it('b should not find a route', function() {
      assert.equal(graph.nodes.b._cycleFound, false);
    });
    it('c should not find a route', function() {
      assert.equal(graph.nodes.c._cycleFound, false);
    });
  });
});
