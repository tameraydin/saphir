(function() {
  'use strict';

  function _isSaphirObject(value) {
    return value instanceof SaphirObject ||
      value instanceof SaphirArray;
  }

  function _isObject(value) {
    return value instanceof Object &&
      Object.getPrototypeOf(value) === Object.prototype;
  }

  function getObjectDescriptor(value, callbacks, key) {
    return {
      enumerable: true,
      configurable: true,
      get: function() {
        return value;
      },
      set: function(newValue) {
        if (newValue !== value) {
          let oldValue = value;

          value = saphir.createObservable(newValue);
          if (callbacks[key]) {
            callbacks[key](value, oldValue);
          }
        }
      }
    };
  }

  class SaphirObject {
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

  class SaphirArray {
    subscribe() {
      return true;
    }
    unsubscribe() {
      return true;
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

      Object.defineProperty(
        observable,
        '__cb',
        {
          writable: true,
          value: {}
        });

      let value;
      for (let key in model) {
        value = this.createObservable(model[key]);

        Object.defineProperty(
          observable,
          key,
          getObjectDescriptor(value, observable.__cb, key));
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
