var Node = require('../index.js');

var assert = require('assert');
var sinon = require('sinon');

describe('Three nodes', function() {
  var nodes = {
  };
  var inSpy;
  beforeEach(function() {
    nodes.a = new Node();
    nodes.b = new Node();
    nodes.c = new Node();
    nodes.a.addNeighbor('b', 'out', function(msgObj) {
      setTimeout(function () {
        nodes.b.handleStatusMessage('a', 'in', msgObj);
      }, 0);
    });
    nodes.a.addNeighbor('c', 'in', function(msgObj) {
      setTimeout(function () {
        nodes.c.handleStatusMessage('a', 'out', msgObj);
      }, 0);
    });
    nodes.b.addNeighbor('c', 'out', function(msgObj) {
      setTimeout(function () {
        nodes.c.handleStatusMessage('b', 'in', msgObj);
      }, 0);
    });
    nodes.b.addNeighbor('a', 'in', function(msgObj) {
      setTimeout(function () {
        nodes.a.handleStatusMessage('b', 'out', msgObj);
      }, 0);
    });
    nodes.c.addNeighbor('a', 'out', function(msgObj) {
      setTimeout(function () {
        nodes.a.handleStatusMessage('c', 'in', msgObj);
      }, 0);
    });
    nodes.c.addNeighbor('b', 'in', function(msgObj) {
      setTimeout(function () {
        nodes.b.handleStatusMessage('c', 'out', msgObj);
      }, 0);
    });
//    return new Promise((resolve) => {
//      setTimeout(function() {
//        resolve();
//      }, 100);
//    });
  });

  it('should find a cycle', function() {
    setTimeout(function() {
      assert.deepEqual(nodes.a.getActiveNeighbors(), {
        'in': ['c'],
        out: ['b'],
      });
      assert.deepEqual(nodes.b.getActiveNeighbors(), {
        'in': ['a'],
        out: ['c'],
      });
      assert.deepEqual(nodes.c.getActiveNeighbors(), {
        'in': ['b'],
        out: ['a'],
      });
    }, 100);
  });
  describe('incoming probe message for a', function() {
    beforeEach(function(done) {
      nodes.a.handleProbeMessage('c', 'in', {
        treeToken: 'asdf',
      });
      setTimeout(done, 10);
    });
    it('should find a route', function() {
    });
  });
});
