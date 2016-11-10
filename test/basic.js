var Node = require('../index.js');

var assert = require('assert');
var sinon = require('sinon');

describe('Add in-neighbor', function() {
  var node;
  var inSpy;
  beforeEach(function() {
    node = new Node();
    var timestampSpy = sinon.stub(node, '_getTimestamp', function() {
      return 123456;
    });
    inSpy = sinon.spy();
    node.addNeighbor('a', 'in', inSpy);
  });

  it('should start false wave to in-neighbor', function() {
    assert.deepEqual(inSpy.args, [[{
      value: false,
      timestamp: 123456,
    }]]);
  });
});

describe('Add out-neighbor', function() {
  var node;
  var outSpy;
  beforeEach(function() {
    node = new Node();
    var timestampSpy = sinon.stub(node, '_getTimestamp', function() {
      return 123456;
    });
    outSpy = sinon.spy();
    node.addNeighbor('b', 'out', outSpy);
  });

  it('should start false wave to out-neighbor', function() {
    assert.deepEqual(outSpy.args, [[{
      timestamp: 123456,
      value: false,
    }]]);
  });
});

describe('Add two in-neighbors', function() {
  var node;
  var inSpy1;
  var inSpy2;
  beforeEach(function() {
    node = new Node();
    var counter = 1;
    var timestampSpy = sinon.stub(node, '_getTimestamp', function() {
      return counter++;
    });
    inSpy1 = sinon.spy();
    inSpy2 = sinon.spy();
    node.addNeighbor('a', 'in', inSpy1);
    node.addNeighbor('b', 'in', inSpy2);
  });

  it('should start false wave to each in-neighbor', function() {
    assert.deepEqual(inSpy1.args, [[{
      value: false,
      timestamp: 1,
    }]]);
    assert.deepEqual(inSpy2.args, [[{
      value: false,
      timestamp: 2,
    }]]);
  });

  describe('Add out-neighbor', function() {
    var outSpy;
    beforeEach(function() {
      outSpy = sinon.spy();
      node.addNeighbor('b', 'out', outSpy);
    });

    it('should not start false wave to out-neighbor', function() {
      assert.deepEqual(outSpy.args, []);
    });
  });

});

describe('Add two out-neighbors', function() {
  var node;
  var outSpy1;
  var outSpy2;
  beforeEach(function() {
    node = new Node();
    var counter = 1;
    var timestampSpy = sinon.stub(node, '_getTimestamp', function() {
      return counter++;
    });
    outSpy1 = sinon.spy();
    outSpy2 = sinon.spy();
    node.addNeighbor('a', 'out', outSpy1);
    node.addNeighbor('b', 'out', outSpy2);
  });

  it('should start false wave to each out-neighbor', function() {
    assert.deepEqual(outSpy1.args, [[{
      value: false,
      timestamp: 1,
    }]]);
    assert.deepEqual(outSpy2.args, [[{
      value: false,
      timestamp: 2,
    }]]);
  });

  describe('Add in-neighbor', function() {
    var inSpy;
    beforeEach(function() {
      inSpy = sinon.spy();
      node.addNeighbor('a', 'in', inSpy);
    });

    it('should not start false wave to in-neighbor', function() {
      assert.deepEqual(inSpy.args, []);
    });
  });
});

describe('Add in-neighbor, then out-neighbor', function() {
  var node;
  var inSpy;
  var outSpy;
  beforeEach(function() {
    node = new Node();
    var counter = 1;
    var timestampSpy = sinon.stub(node, '_getTimestamp', function() {
      return counter++;
    });
    inSpy = sinon.spy();
    outSpy = sinon.spy();
    node.addNeighbor('a', 'in', inSpy);
    node.addNeighbor('b', 'out', outSpy);
  });

  it('should start false-then-true wave to in-neighbor', function() {
    assert.deepEqual(inSpy.args, [[{
      value: false,
      timestamp: 1,
    }], [{
      value: true,
      timestamp: 2,
    }]]);
    assert.deepEqual(outSpy.args, []);
  });

  describe('in-neighbor replies false', function() {
    beforeEach(function() {
      node.handleStatusMessage('a', 'in', {
        value: false,
        timestamp: 123456,
      });
    });

    it('should start false wave to out-neighbor', function() {
      assert.deepEqual(outSpy.args, [[{
        value: false,
        timestamp: 123456,
      }]]);
    });
  });
});
