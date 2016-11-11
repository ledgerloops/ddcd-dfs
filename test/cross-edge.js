var Node = require('../index.js');
var Graph = require('./helpers/graph.js');
var assert = require('assert');

describe('Cross-edge', function() {
  var graph;
  beforeEach(function() {
    graph = new Graph({
      a: new Node(),
      b: new Node(),
      c: new Node(),
      d: new Node(),
      e: new Node(),
      f: new Node(),
    });

    // a <-> b -> c -> d -> f
    //       \    ^
    //        v  /
    //         e

    graph.connect('a', 'b');

    graph.connect('b', 'a');
    graph.connect('b', 'c');
    graph.connect('b', 'e');

    graph.connect('e', 'c');

    graph.connect('c', 'd');

    graph.connect('d', 'f');

    return graph.propagate();
  });

  it('should find both cycles', function() {
    assert.deepEqual(graph.nodes.a.getActiveNeighbors(), {
      'in': ['b'],
      out: ['b'],
    });
    assert.deepEqual(graph.nodes.b.getActiveNeighbors(), {
      'in': ['a'],
      out: ['a', 'c', 'e'],
    });
    assert.deepEqual(graph.nodes.c.getActiveNeighbors(), {
      'in': ['b', 'e'],
      out: ['d'],
    });
    assert.deepEqual(graph.nodes.d.getActiveNeighbors(), {
      'in': ['c'],
      out: [],
    });
    assert.deepEqual(graph.nodes.e.getActiveNeighbors(), {
      'in': ['b'],
      out: ['c'],
    });
    assert.deepEqual(graph.nodes.f.getActiveNeighbors(), {
      'in': ['d'],
      out: [],
    });
  });
  describe('node b starts probe message', function() {
    beforeEach(function() {
      graph.nodes.b.startProbeMessage();
      return graph.propagate();
    });

    var shouldFindRoute = {
      a: false,
      b: false,
      c: false,
      d: true,
      e: false,
      f: false,
    };
    for (var nodeId in shouldFindRoute) { 
      it(`${nodeId} should ${(shouldFindRoute[nodeId] ? '' : 'not')} find a route`, function() {
        assert.equal(graph.nodes[nodeId]._cycleFound, shouldFindRoute[nodeId]);
      });
    }
  });
});
