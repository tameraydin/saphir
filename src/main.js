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

  function getArrayDescriptor(observable, key) {
    return {
      enumerable: true,
      configurable: true,
      get() {
        return observable.__value[key];
      },
      set(newValue) {
        if (newValue !== observable.__value[key]) {
          let oldValue = observable.__value[key];

          observable.__value[key] = saphir.createObservable(newValue);
          if (observable.__cb[key]) {
            observable.__cb[key](observable.__value[key], oldValue);
          }
        }
      }
    };
  }

  function getObjectDescriptor(value, callbacks, key) {
    return {
      enumerable: true,
      configurable: true,
      get() {
        return value;
      },
      set(newValue) {
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

  var SaphirArrayBase = function() {};
  SaphirArrayBase.prototype = {};

  function getArrDescriptor(prop) {
    return function() {
      Array.prototype[prop].apply(this.__value, arguments);
      _updateKeys(this);
    };
  }

  let arrayProps = Object.getOwnPropertyNames(Array.prototype);
  for (let i = 0; i < arrayProps.length; i++) {
    let prop = arrayProps[i];

    if (typeof Array.prototype[prop] === 'function') {
      Object.defineProperty(
        SaphirArrayBase.prototype,
        prop,
        {
          value: getArrDescriptor(prop)
        });
    }
  }

  function _updateKeys(model) {
    let value;
    for (let key in model.__value) {
      value = saphir.createObservable(model.__value[key]);

      Object.defineProperty(
        model,
        key,
        getArrayDescriptor(model, key));
    }
  }

  class SaphirArray extends SaphirArrayBase {
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
          getArrayDescriptor(this, key));
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
          getObjectDescriptor(value, this.__cb, key));
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
