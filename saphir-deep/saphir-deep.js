(function() {
  'use strict';

  /**
   * Converts given value into a Saphir object/array
   *
   * @param  {Any}
   * @param  {Object}
   * @param  {String}
   * @return {Any}
   */
  function _convertToSaphir(value, parent, parentKey) {
    if (_isSaphirObject(value)) {
      value.__p = parent;
      value.__pk = parentKey;
      return value;

    } else if (value instanceof Array) {
      return new SaphirArray(value, parent, parentKey);

    } else if (_isObject(value)) {
      return new SaphirObject(value, parent, parentKey);
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
   * Informs updated object's parents and triggers its callback
   */
  function _emitCallback() {
    /*jshint validthis:true */
    let parent = this.__p;

    if (parent) {
      if (parent instanceof SaphirObject) {
        if (parent.__cb[this.__pk]) {
          parent.__cb[this.__pk](this);
        }
      } else {
        if (parent.__cb) {
          parent.__cb(parent);
        }
      }

      parent.__ecb();
    }
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
        this.__ecb();
      };
    });

  class SaphirDescriptor {
    constructor() {
      this.enumerable = true;
      this.configurable = true;
    }
  }

  class SaphirArrayDescriptor extends SaphirDescriptor {
    constructor(key) {
      super();

      this.get = function() {
        return this.__value[key];
      };

      this.set = function(newValue) {
        let value = this.__value[key];

        if (newValue !== value) {
          this.__value[key] = _convertToSaphir(newValue, this);

          if (this.__cb) {
            this.__cb(this);
          }

          this.__ecb();
        }
      };
    }
  }

  class SaphirObjectDescriptor extends SaphirDescriptor {
    constructor(value, key) {
      super();

      this.get = function() {
        return value;
      };

      this.set = function(newValue) {
        if (newValue !== value) {

          value = _convertToSaphir(newValue, this, key);

          if (this.__cb[key]) {
            this.__cb[key](value);
          }

          this.__ecb();
        }
      };
    }
  }

  class SaphirArray extends ArrayPrototype {
    constructor(model, parent, parentKey) {
      super();

      Object.defineProperty(
        this,
        '__p', // parent
        {
          writable: true,
          value: parent
        });

      Object.defineProperty(
        this,
        '__pk', // parent
        {
          writable: true,
          value: parentKey
        });

      Object.defineProperty(
        this,
        '__cb', // callback
        {
          writable: true,
          value: null
        });

      Object.defineProperty(
        this,
        '__ecb', // emit callback
        {
          writable: false,
          value: _emitCallback
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
        'length',
        {
          get() {
            return this.__value.length;
          }
        });

      Object.defineProperty(
        this,
        'updateKeys',
        {
          value: function(model = this.__value) {
            for (let key in model) {
              this.__value[key] = _convertToSaphir(model[key], this, key);

              Object.defineProperty(
                this,
                key,
                new SaphirArrayDescriptor(key));
            }
          }
        });

      this.updateKeys(model);
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
    constructor(model, parent, parentKey) {
      Object.defineProperty(
        this,
        '__p', // parent
        {
          writable: true,
          value: parent
        });

      Object.defineProperty(
        this,
        '__pk', // parent key
        {
          writable: true,
          value: parentKey
        });

      Object.defineProperty(
        this,
        '__cb', // callback
        {
          writable: true,
          value: {}
        });

      Object.defineProperty(
        this,
        '__ecb', // emit callback
        {
          writable: false,
          value: _emitCallback
        });

      let value;
      for (let key in model) {
        value = _convertToSaphir(model[key], this, key);

        Object.defineProperty(
          this,
          key,
          new SaphirObjectDescriptor(value, key));
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
