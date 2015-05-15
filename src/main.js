(function() {
  'use strict';

  function _convertToSaphir(value) {
    if (_isSaphirObject(value)) {
      return value;

    } else if (value instanceof Array) {
      return new SaphirArray(value);

    } else if (_isObject(value)) {
      return new SaphirObject(value);
    }

    return value;
  }

  /**
   * Determine whether the given value is a Saphir object
   *
   * @param  {Any}     Value
   * @return {Boolean} Result
   */
  function _isSaphirObject(value) {
    return value instanceof SaphirObject ||
      value instanceof SaphirArray;
  }

  /**
   * Determine whether the given value is an Object literal
   *
   * @param  {Any}     Value
   * @return {Boolean} Result
   */
  function _isObject(value) {
    return value instanceof Object &&
      Object.getPrototypeOf(value) === Object.prototype;
  }

  /**
   * Decorates certain type of methods in given class's
   * prototype and assigns to given object.
   *
   * @param  {Object}   Object to assign
   * @param  {Class}    Base class
   * @param  {String}   Type of methods
   * @param  {Function} Decorator function
   */
  function _decorateWithEnhancedMethods(obj, Base, filter, descriptor) {
    let supportedArrayMethods = Object.getOwnPropertyNames(Base.prototype);

    for (let i = 0; i < supportedArrayMethods.length; i++) {
      let prop = supportedArrayMethods[i];

      if (typeof Base.prototype[prop] === filter &&
        prop !== 'constructor') {
          Object.defineProperty(
            obj,
            prop,
            {
              writable: true,
              value: descriptor(Base, prop)
            });
      }
    }
  }

  /**
   * [ArrayPrototype description]
   */
  let ArrayPrototype = function() {};
  ArrayPrototype.prototype = {};

  _decorateWithEnhancedMethods(
    ArrayPrototype.prototype,
    Array,
    'function',
    function(Base, prop) {
      return function() {
        Base.prototype[prop].apply(this.__value, arguments);
        this.updateKeys();
        if (this.__cb) {
          this.__cb(this);
        }
      };
    });

  class SaphirDescriptor {
    constructor() {
      this.enumerable = true;
      this.configurable = true;
    }
  }

  class SaphirArrayDescriptor extends SaphirDescriptor {
    constructor(observable, key) {
      super();

      this.get = function() {
        return observable.__value[key];
      };

      this.set = function(newValue) {
        let value = observable.__value[key];

        if (newValue !== value) {
          observable.__value[key] = _convertToSaphir(newValue);

          if (observable.__cb) {
            observable.__cb(observable);
          }
        }
      };
    }
  }

  class SaphirObjectDescriptor extends SaphirDescriptor {
    constructor(value, callbacks, key) {
      super();

      this.get = function() {
        return value;
      };

      this.set = function(newValue) {
        if (newValue !== value) {
          let oldValue = value;

          value = _convertToSaphir(newValue);

          if (callbacks[key]) {
            callbacks[key](value, oldValue);
          }
        }
      };
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

      Object.defineProperty(
        this,
        'updateKeys',
        {
          value: function(model = this.__value) {
            for (let key in model) {
              this.__value[key] = _convertToSaphir(model[key]);

              Object.defineProperty(
                this,
                key,
                new SaphirArrayDescriptor(this, key));
            }
          }
        });

      this.updateKeys(model);

      Object.defineProperty(
        this,
        'length',
        {
          get() {
            return this.__value.length;
          }
        });
    }

    subscribe(callback) {
      this.__cb = callback;
      return this;
    }

    unsubscribe() {
      this.__cb = null;
      return this;
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
        value = _convertToSaphir(model[key]);

        Object.defineProperty(
          this,
          key,
          new SaphirObjectDescriptor(value, this.__cb, key));
      }
    }

    subscribe(prop, callback) {
      if (typeof prop === 'string' &&
          typeof callback === 'function' &&
          this.hasOwnProperty(prop)) {
        this.__cb[prop] = callback;
      }
      return this;
    }

    unsubscribe(prop) {
      if (typeof prop === 'string' &&
          this.__cb[prop]) {
        this.__cb[prop] = null;
      }
      return this;
    }
  }

  // MODULE
  let saphir = {
    SaphirObject: SaphirObject,
    SaphirArray: SaphirArray
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
