var saphir = require('../test/saphir.js'),
  SaphirObject = saphir.SaphirObject,
  SaphirArray = saphir.SaphirArray,
  observable,
  observableObj,
  fake = {
    callback: function() {}
  };

describe('saphir', function() {

  it('should have methods', function() {
    expect(saphir.SaphirObject).toBeDefined();
    expect(saphir.SaphirArray).toBeDefined();
  });

  describe('observables', function() {
    var observableObj, observableArr;

    beforeEach(function() {
      observableObj = new SaphirObject({});
      observableArr = new SaphirArray([]);
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
      observableObj = new SaphirObject({
        a: 1,
        b: 2
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
      observableObj.subscribe()
      expect(observableObj.__cb).toEqual({});
      observableObj.subscribe('')
      expect(observableObj.__cb).toEqual({});
      observableObj.subscribe('a')
      expect(observableObj.__cb).toEqual({});
      observableObj.subscribe('c', function() {})
      expect(observableObj.__cb).toEqual({});
      observableObj.subscribe('b', function() {});
      expect(observableObj.__cb).not.toEqual({});
    });

    it('subscribtion should work', function() {
      var subId = observableObj.subscribe('a', function() {
        fake.callback.apply(this, arguments);
      });

      // expect(typeof subId).toBe('string');
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
      observableObj.subscribe('a', function() {
        fake.callback.apply(this, arguments);
      });

      observableObj.unsubscribe('a');

      observableObj.a = 2;
      expect(fake.callback).not.toHaveBeenCalled();
      expect(observableObj.__cb.a).toBe(null);
    });
  });

  describe('nested object', function() {
    beforeEach(function() {
      observableObj = new SaphirObject({
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
        new SaphirObject({
          f: {
            g: 1
          }
        }));
      expect(fake.callback.calls.argsFor(0)[1]).toEqual(
        new SaphirObject({
          c: 2,
          d: {
            e: 3
          }
        }));
    });
  });

  describe('array', function() {
    beforeEach(function() {
      observableArr = new SaphirArray([1, {
        a: 2
      }, 3]);
      observableArr.subscribe(function() {
        fake.callback.apply(this, arguments);
      });
      spyOn(fake, 'callback').and.callThrough();
    });

    it('accessors should work', function() {
      expect(observableArr[0]).toBe(1);
      expect(observableArr[1]).toEqual(new SaphirObject({
        a: 2
      }));
      expect(observableArr[1].a).toBe(2);
      expect(observableArr[2]).toBe(3);
      expect(observableArr.length).toBe(3);

      observableArr[2] = 4;
      expect(observableArr[2]).toBe(4);
    });

    it('should be able to apply default Array methods', function() {
      observableArr.push(4);
      expect(observableArr[3]).toBe(4);
      expect(observableArr.length).toBe(4);

      delete observableArr[2];
      expect(observableArr[2]).toBe(undefined);
      expect(observableArr.length).toBe(4);
    });

    it('subscribtion should work', function() {
      expect(observableArr.__cb).toBeDefined();
      expect(fake.callback).not.toHaveBeenCalled();

      observableArr[0] = 2;
      expect(fake.callback).toHaveBeenCalled();
      expect(fake.callback.calls.argsFor(0)).toEqual([new SaphirArray([2, {
        a: 2
      }, 3])]);

      observableArr[0] = 2;
      expect(fake.callback.calls.count()).toEqual(1);

      observableArr.push(4);
      expect(fake.callback.calls.count()).toEqual(2);

      observableArr.splice(2, 2);
      expect(fake.callback.calls.count()).toEqual(3);
      expect(observableArr.length).toBe(2);

      // observableArr[1].a = 1;
      // expect(fake.callback.calls.count()).toEqual(4);
      // expect(fake.callback.calls.argsFor(3)).toEqual([observableArr]);

      // observableArr[1].subscribe('a', function() {
      //   fake.callback.apply(this, arguments);
      // });
      // observableArr[1].a = 0;
      // expect(fake.callback.calls.count()).toEqual(6);
      // expect(fake.callback.calls.argsFor(4)).toEqual([0, 1]);
      // expect(fake.callback.calls.argsFor(5)).toEqual([observableArr]);

      // observableArr[1].a = {b: 1}; // 8 calls
      // observableArr[1].a.subscribe('b', function() {
      //   fake.callback.apply(this, arguments);
      // });
      // observableArr[1].a.b = 2;
      // expect(fake.callback.calls.count()).toEqual(11);
    });
  });
});
