if (typeof Saphir === 'undefined') {
  var saphir = require('../test/saphir.js');
}

var module, observable;

describe('saphir', function() {

  beforeEach(function() {
    module = saphir;
  });

  it('should have methods', function() {
    expect(module.createObservable).toBeDefined();
  });

  describe('observables', function() {
    var observableObj, observableArr;

    beforeEach(function() {
      observableObj = saphir.createObservable({});
      observableArr = saphir.createObservable([]);
    });

    it('should have its methods', function() {
      expect(observableObj.observe).toBeDefined();
      expect(observableArr.observe).toBeDefined();
    });
  });
});
