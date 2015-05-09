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
      expect(observableObj.forget).toBeDefined();
      expect(observableArr.forget).toBeDefined();
    });
  });

  describe('observation', function() {
    var observableObj;
    var fake = {
      callback: function() {}
    };

    beforeEach(function() {
      observableObj = saphir.createObservable({
        a: 1,
        b: 2
      });
      observableObj.observe('a', function() {
        fake.callback.apply(this, arguments);
      });
      spyOn(fake, 'callback').and.callThrough();
    });

    it('parameters should be valid', function() {
      expect(observableObj.observe()).toBeFalsy();
      expect(observableObj.observe('')).toBeFalsy();
      expect(observableObj.observe('a')).toBeFalsy();
      expect(observableObj.observe('b', function() {})).toBeTruthy();
      expect(observableObj.observe('c', function() {})).toBeFalsy();
    });

    it('should work', function() {
      expect(fake.callback).not.toHaveBeenCalled();

      observableObj.a = 2;
      expect(fake.callback).toHaveBeenCalled();

      observableObj.a = 2;
      expect(fake.callback.calls.count()).toEqual(1);

      observableObj.a = 3;
      expect(fake.callback.calls.count()).toEqual(2);
      expect(fake.callback.calls.argsFor(1)).toEqual([3, 2]);

      observableObj.b = 1;
      expect(fake.callback.calls.count()).toEqual(2);
    });
  });
});
