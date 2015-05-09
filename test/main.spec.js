var saphir = require('../test/saphir.js'),
  observable,
  observableObj,
  fake = {
    callback: function() {}
  };

describe('saphir', function() {

  it('should have methods', function() {
    expect(saphir.createObservable).toBeDefined();
  });

  describe('observables', function() {
    var observableObj, observableArr;

    beforeEach(function() {
      observableObj = saphir.createObservable({});
      observableArr = saphir.createObservable([]);
    });

    it('should have its methods', function() {
      expect(observableObj.subscribe).toBeDefined();
      expect(observableArr.subscribe).toBeDefined();
      expect(observableObj.unsubscribe).toBeDefined();
      expect(observableArr.unsubscribe).toBeDefined();
    });
  });

  describe('object', function() {
    beforeEach(function() {
      observableObj = saphir.createObservable({
        a: 1,
        b: 2
      });
      observableObj.subscribe('a', function() {
        fake.callback.apply(this, arguments);
      });
      spyOn(fake, 'callback').and.callThrough();
    });

    it('accessors should work', function() {
      expect(observableObj.a).toBe(1);
      expect(observableObj.b).toBe(2);

      observableObj.a = 2;
      expect(observableObj.a).toBe(2);

      observableObj.b = 3;
      expect(observableObj.b).toBe(3);
    });

    it('subscribtion should only accept valid parameters', function() {
      expect(observableObj.subscribe()).toBeFalsy();
      expect(observableObj.subscribe('')).toBeFalsy();
      expect(observableObj.subscribe('a')).toBeFalsy();
      expect(observableObj.subscribe('b', function() {})).toBeTruthy();
      expect(observableObj.subscribe('c', function() {})).toBeFalsy();
    });

    it('subscribtion should work', function() {
      expect(observableObj.__cb.a).toBeDefined();
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

    it('unsubscribtion should work', function() {
      observableObj.unsubscribe('a');

      observableObj.a = 2;
      expect(fake.callback).not.toHaveBeenCalled();
      expect(observableObj.__cb.a).toBe(null);
    });
  });

  describe('nested object', function() {
    beforeEach(function() {
      observableObj = saphir.createObservable({
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3
          }
        }
      });
      observableObj.subscribe('b', function() {
        fake.callback.apply(this, arguments);
      });
      spyOn(fake, 'callback').and.callThrough();
    });

    it('should be converted to SaphirObject', function() {
      expect(observableObj.b.d.subscribe).toBeDefined();
    });

    it('subscribtion should work', function() {
      expect(fake.callback).not.toHaveBeenCalled();

      observableObj.b = 2;
      expect(fake.callback).toHaveBeenCalled();
    });

    it('should convert its new Object value to SaphirObject', function() {
      observableObj.b = {
        f: {
          g: 1
        }
      };

      expect(observableObj.b.f.subscribe).toBeDefined();
      expect(fake.callback.calls.argsFor(0)[0]).toEqual(
        saphir.createObservable({
          f: {
            g: 1
          }
        }));
      expect(fake.callback.calls.argsFor(0)[1]).toEqual(
        saphir.createObservable({
          c: 2,
          d: {
            e: 3
          }
        }));
    });
  });
});
