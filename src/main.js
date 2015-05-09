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

  function _copy(value) {
    if (_isObject(value) || value instanceof Array) {
      return JSON.parse(JSON.stringify(value));
    }
    return value;
  }

  function _getGetter(value) {
    return function() {
      return value;
    };
  }

  function _getSetter(value, callbacks, key) {
    return function(newValue) {
      if (newValue !== value) {
        let oldValue = _copy(value);

        if (!_isSaphirObject(newValue)) {
          if (newValue instanceof Array) {
            newValue = new SaphirArray(newValue);
          } else if (_isObject(newValue)) {
            newValue = new SaphirObject(newValue);
          }
        }

        value = newValue;
        if (callbacks[key]) {
          callbacks[key](newValue, oldValue);
        }
      }
    };
  }

  class SaphirObject {
    observe(prop, callback) {
      if (typeof prop === 'string' &&
          typeof callback === 'function' &&
          this.hasOwnProperty(prop)) {
        this.__callbacks[prop] = callback;
        return true;
      }
      return false;
    }

    forget(prop) {
      if (typeof prop === 'string' &&
          this.__callbacks[prop]) {
        this.__callbacks[prop] = null;
        return true;
      }
      return false;
    }
  }

  class SaphirArray {
    observe() {
      return true;
    }
    forget() {
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
        return false;
      }

      Object.defineProperty(
        observable,
        '__callbacks',
        {
          writable: true,
          value: {}
        });

      let value;
      for (let key in model) {
        value = model[key];

        Object.defineProperty(
          observable,
          key,
          {
            enumerable: true,
            configurable: true,
            get: _getGetter(value),
            set: _getSetter(value, observable.__callbacks, key)
          });
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
