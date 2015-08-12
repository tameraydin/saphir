(function() {
  'use strict';

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
          this.__value[key] = newValue;

          if (this.__cb) {
            this.__cb(this);
          }
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
          let oldValue = value;

          value = newValue;

          if (this.__cb[key]) {
            this.__cb[key](value, oldValue);
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
              this.__value[key] = model[key];

              Object.defineProperty(
                this,
                key,
                new SaphirArrayDescriptor(key));
            }
          }
        });

      this.updateKeys(model);
    }

    _subscribe(callback) {
      this.__cb = callback;
      return this;
    }

    _unsubscribe() {
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
        value = model[key];

        Object.defineProperty(
          this,
          key,
          new SaphirObjectDescriptor(value, key));
      }
    }

    _subscribe(prop, callback) {
      if (typeof prop === 'string' &&
          typeof callback === 'function' &&
          this.hasOwnProperty(prop)) {
        this.__cb[prop] = callback;
      }
      return this;
    }

    _unsubscribe(prop) {
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
