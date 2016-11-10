var Node = require('../index.js');

var assert = require('assert');

describe('Three nodes', function() {
  var nodes = {
  };
  var msgQueue = [];
  function propagate() {
    while (msgQueue.length) {
      var args = msgQueue.shift();
      // console.log(`From ${args[1]} to ${args[0]}: ${args[2]}, ${args[3].value}, ${args[3].timestamp}, messages left: ${msgQueue.length}`);
      nodes[args[0]].handleStatusMessage(args[1], args[2], args[3]);
    }
  }

  beforeEach(function() {
    nodes.a = new Node();
    nodes.b = new Node();
    nodes.c = new Node();
    // a -> b
    nodes.a.addNeighbor('b', 'out', function(msgObj) {
      msgQueue.push([ 'b', 'a', 'in', msgObj ]);
    });
    nodes.b.addNeighbor('a', 'in', function(msgObj) {
      msgQueue.push([ 'a', 'b', 'out', msgObj ]);
    });

    // b -> c
    nodes.b.addNeighbor('c', 'out', function(msgObj) {
      msgQueue.push([ 'c', 'b', 'in', msgObj ]);
    });
    nodes.c.addNeighbor('b', 'in', function(msgObj) {
      msgQueue.push([ 'b', 'c', 'out', msgObj ]);
    });

    // c -> a
    nodes.a.addNeighbor('c', 'in', function(msgObj) {
      msgQueue.push([ 'c', 'a', 'out', msgObj ]);
    });
    nodes.c.addNeighbor('a', 'out', function(msgObj) {
      msgQueue.push([ 'a', 'c', 'in', msgObj ]);
    });

    propagate();
  });

  it('should find a cycle', function() {
    //setTimeout(function() {
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
    //}, 100);
  });
//   describe('incoming probe message for a', function() {
//     beforeEach(function(done) {
//       nodes.a.handleProbeMessage('c', 'in', {
//         treeToken: 'asdf',
//       });
//       setTimeout(done, 10);
//     });
//     it('should find a route', function() {
//     });
//   });
});
