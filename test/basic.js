var Node = require('../index.js');

var assert = require('assert');
var sinon = require('sinon');

describe('Add in-neighbor', function() {
  var node;
  var inSpy;
  beforeEach(function() {
    node = new Node();
    inSpy = sinon.spy();
    node.addNeighbor('a', 'in', inSpy);
  });

  it('should start false wave to in-neighbor', function() {
    assert.deepEqual(inSpy.args, [[{
      value: false,
    }]]);
  });
});

describe('Add out-neighbor', function() {
  var node;
  var outSpy;
  beforeEach(function() {
    node = new Node();
    outSpy = sinon.spy();
    node.addNeighbor('b', 'out', outSpy);
  });

  it('should start false wave to out-neighbor', function() {
    assert.deepEqual(outSpy.args, [[{
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
    inSpy1 = sinon.spy();
    inSpy2 = sinon.spy();
    node.addNeighbor('a', 'in', inSpy1);
    node.addNeighbor('b', 'in', inSpy2);
  });

  it('should start false wave to each in-neighbor', function() {
    assert.deepEqual(inSpy1.args, [[{
      value: false,
    }]]);
    assert.deepEqual(inSpy2.args, [[{
      value: false,
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
    outSpy1 = sinon.spy();
    outSpy2 = sinon.spy();
    node.addNeighbor('a', 'out', outSpy1);
    node.addNeighbor('b', 'out', outSpy2);
  });

  it('should start false wave to each out-neighbor', function() {
    assert.deepEqual(outSpy1.args, [[{
      value: false,
    }]]);
    assert.deepEqual(outSpy2.args, [[{
      value: false,
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
    inSpy = sinon.spy();
    outSpy = sinon.spy();
    node.addNeighbor('a', 'in', inSpy);
    node.addNeighbor('b', 'out', outSpy);
  });

  it('should start false-then-true wave to in-neighbor', function() {
    assert.deepEqual(inSpy.args, [[{
      value: false,
    }], [{
      value: true,
    }]]);
    assert.deepEqual(outSpy.args, []);
  });

  describe('in-neighbor replies false', function() {
    beforeEach(function() {
      node.handleMessage('a', 'in', { value: false });
    });

    it('should start false wave to out-neighbor', function() {
      assert.deepEqual(outSpy.args, [[{
        value: false,
      }]]);
    });
  });
});
