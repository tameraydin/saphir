(function() {
  'use strict';

  /**
   * Determine whether the given value is a Saphir object
   *
   * @param  {Any}     value
   * @return {Boolean} result
   */
  function _isSaphirObject(value) {
    return value instanceof SaphirObject ||
      value instanceof SaphirArray;
  }

  /**
   * Determine whether the given value is an Object literal
   *
   * @param  {Any}     value
   * @return {Boolean} result
   */
  function _isObject(value) {
    return value instanceof Object &&
      Object.getPrototypeOf(value) === Object.prototype;
  }

  /**
   * [_decorateWithEnhancedMethods description]
   *
   * @param  {[type]}
   * @param  {[type]}
   * @param  {[type]}
   * @param  {[type]}
   */
  function _decorateWithEnhancedMethods(obj, Base, filter, descriptor) {
    let supportedArrayMethods = Object.getOwnPropertyNames(Base.prototype);

    for (let i = 0; i < supportedArrayMethods.length; i++) {
      let prop = supportedArrayMethods[i];

      if (typeof Base.prototype[prop] === filter) {
        Object.defineProperty(
          obj,
          prop,
          {
            value: descriptor(prop)
          });
      }
    }
  }

  class SapphireArrayDescriptor {
    constructor(observable, key) {
      this.enumerable = true;
      this.configurable = true;
      this.get = function() {
        return observable.__value[key];
      };
      this.set = function(newValue) {
        let value = observable.__value[key];

        if (newValue !== value) {
          let oldValue = value;

          observable.__value[key] = saphir.createObservable(newValue);

          let callbacks = observable.__cb[key];
          if (callbacks) {
            callbacks(value, oldValue);
          }
        }
      };
    }
  }

  class SapphireObjectDescriptor {
    constructor(value, callbacks, key) {
      this.enumerable = true;
      this.configurable = true;
      this.get = function() {
        return value;
      };
      this.set = function(newValue) {
        if (newValue !== value) {
          let oldValue = value;

          value = saphir.createObservable(newValue);

          if (callbacks[key]) {
            callbacks[key](value, oldValue);
          }
        }
      };
    }
  }

  let ArrayPrototype = function() {};
  ArrayPrototype.prototype = {};
  _decorateWithEnhancedMethods(
    ArrayPrototype.prototype,
    Array,
    'function',
    function(prop) {
      return function() {
        Array.prototype[prop].apply(this.__value, arguments);
        _updateKeys(this);
      };
    });

  function _updateKeys(model) {
    let value;
    for (let key in model.__value) {
      value = saphir.createObservable(model.__value[key]);

      Object.defineProperty(
        model,
        key,
        new SapphireArrayDescriptor(model, key));
    }
  }

  class SaphirArray extends ArrayPrototype {
    constructor(model) {
      super();

      Object.defineProperty(
        this,
        '__cb',
        {
          writable: true,
          value: {}
        });

      Object.defineProperty(
        this,
        '__value',
        {
          writable: true,
          value: []
        });

      let value;
      for (let key in model) {
        value = saphir.createObservable(model[key]);
        this.__value[key] = value;

        Object.defineProperty(
          this,
          key,
          new SapphireArrayDescriptor(this, key));
      }

      Object.defineProperty(
        this,
        'length',
        {
          get() {
            return this.__value.length;
          }
        });
    }

    subscribe() {
      return true;
    }

    unsubscribe() {
      return true;
    }
  }

  class SaphirObject {
    constructor(model) {
      Object.defineProperty(
        this,
        '__cb',
        {
          writable: true,
          value: {}
        });

      let value;
      for (let key in model) {
        value = saphir.createObservable(model[key]);

        Object.defineProperty(
          this,
          key,
          new SapphireObjectDescriptor(value, this.__cb, key));
      }
    }

    subscribe(prop, callback) {
      if (typeof prop === 'string' &&
          typeof callback === 'function' &&
          this.hasOwnProperty(prop)) {
        this.__cb[prop] = callback;
        return true;
      }
      return false;
    }

    unsubscribe(prop) {
      if (typeof prop === 'string' &&
          this.__cb[prop]) {
        this.__cb[prop] = null;
        return true;
      }
      return false;
    }
  }

  // MODULE
  let saphir = {
    createObservable: function(model) {
      let observable;

      if (_isSaphirObject(model)) {
        return model;

      } else if (model instanceof Array) {
        observable = new SaphirArray(model);

      } else if (_isObject(model)) {
        observable = new SaphirObject(model);

      } else {
        return model;
      }

      return observable;
    }
  };

  // EXPORT
  let root = this;

  /* istanbul ignore next */
  if (typeof exports !== 'undefined' &&
    typeof module !== 'undefined' &&
    module.exports) {
    module.exports = saphir;

  } else {
    if (typeof define === 'function' && define.amd) {
      define('saphir', [], function() {
        return saphir;
      });

    } else {
      root.saphir = saphir;
    }
  }

}).call(this);
