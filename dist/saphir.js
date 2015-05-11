/**
 * saphir v0.1.0 (https://github.com/tameraydin/saphir)
 * Copyright 2015 Tamer Aydin (http://tamerayd.in)
 * Licensed under MIT
 */
var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x2,
    property = _x3,
    receiver = _x4; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function () {
  'use strict';

  /**
   * Determine whether the given value is a Saphir object
   *
   * @param  {Any}     Value
   * @return {Boolean} Result
   */
  function _isSaphirObject(value) {
    return value instanceof SaphirObject || value instanceof SaphirArray;
  }

  /**
   * Determine whether the given value is an Object literal
   *
   * @param  {Any}     Value
   * @return {Boolean} Result
   */
  function _isObject(value) {
    return value instanceof Object && Object.getPrototypeOf(value) === Object.prototype;
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
    var supportedArrayMethods = Object.getOwnPropertyNames(Base.prototype);

    for (var i = 0; i < supportedArrayMethods.length; i++) {
      var prop = supportedArrayMethods[i];

      if (typeof Base.prototype[prop] === filter && prop !== 'constructor') {
        Object.defineProperty(obj, prop, {
          writable: true,
          value: descriptor(Base, prop)
        });
      }
    }
  }

  /**
   * [ArrayPrototype description]
   */
  var ArrayPrototype = function ArrayPrototype() {};
  ArrayPrototype.prototype = {};

  _decorateWithEnhancedMethods(ArrayPrototype.prototype, Array, 'function', function (Base, prop) {
    return function () {
      Base.prototype[prop].apply(this.__value, arguments);
      this.updateKeys();
    };
  });

  var SapphireDescriptor = function SapphireDescriptor() {
    _classCallCheck(this, SapphireDescriptor);

    this.enumerable = true;
    this.configurable = true;
  };

  var SapphireArrayDescriptor = (function (_SapphireDescriptor) {
    function SapphireArrayDescriptor(observable, key) {
      _classCallCheck(this, SapphireArrayDescriptor);

      _get(Object.getPrototypeOf(SapphireArrayDescriptor.prototype), 'constructor', this).call(this);

      this.get = function () {
        return observable.__value[key];
      };

      this.set = function (newValue) {
        var value = observable.__value[key];

        if (newValue !== value) {
          var oldValue = value;

          observable.__value[key] = saphir.createObservable(newValue);

          var callbacks = observable.__cb[key];
          if (callbacks) {
            callbacks(value, oldValue);
          }
        }
      };
    }

    _inherits(SapphireArrayDescriptor, _SapphireDescriptor);

    return SapphireArrayDescriptor;
  })(SapphireDescriptor);

  var SapphireObjectDescriptor = (function (_SapphireDescriptor2) {
    function SapphireObjectDescriptor(value, callbacks, key) {
      _classCallCheck(this, SapphireObjectDescriptor);

      _get(Object.getPrototypeOf(SapphireObjectDescriptor.prototype), 'constructor', this).call(this);

      this.get = function () {
        return value;
      };

      this.set = function (newValue) {
        if (newValue !== value) {
          var oldValue = value;

          value = saphir.createObservable(newValue);

          if (callbacks[key]) {
            callbacks[key](value, oldValue);
          }
        }
      };
    }

    _inherits(SapphireObjectDescriptor, _SapphireDescriptor2);

    return SapphireObjectDescriptor;
  })(SapphireDescriptor);

  var SaphirArray = (function (_ArrayPrototype) {
    function SaphirArray(model) {
      _classCallCheck(this, SaphirArray);

      _get(Object.getPrototypeOf(SaphirArray.prototype), 'constructor', this).call(this);

      Object.defineProperty(this, '__cb', {
        writable: true,
        value: {}
      });

      Object.defineProperty(this, '__value', {
        writable: true,
        value: []
      });

      Object.defineProperty(this, 'updateKeys', {
        value: function value() {
          var model = arguments[0] === undefined ? this.__value : arguments[0];

          for (var key in model) {
            this.__value[key] = saphir.createObservable(model[key]);

            Object.defineProperty(this, key, new SapphireArrayDescriptor(this, key));
          }
        }
      });

      this.updateKeys(model);

      Object.defineProperty(this, 'length', {
        get: function get() {
          return this.__value.length;
        }
      });
    }

    _inherits(SaphirArray, _ArrayPrototype);

    _createClass(SaphirArray, [{
      key: 'subscribe',
      value: function subscribe() {
        return true;
      }
    }, {
      key: 'unsubscribe',
      value: function unsubscribe() {
        return true;
      }
    }]);

    return SaphirArray;
  })(ArrayPrototype);

  var SaphirObject = (function () {
    function SaphirObject(model) {
      _classCallCheck(this, SaphirObject);

      Object.defineProperty(this, '__cb', {
        writable: true,
        value: {}
      });

      var value = undefined;
      for (var key in model) {
        value = saphir.createObservable(model[key]);

        Object.defineProperty(this, key, new SapphireObjectDescriptor(value, this.__cb, key));
      }
    }

    _createClass(SaphirObject, [{
      key: 'subscribe',
      value: function subscribe(prop, callback) {
        if (typeof prop === 'string' && typeof callback === 'function' && this.hasOwnProperty(prop)) {
          this.__cb[prop] = callback;
          return true;
        }
        return false;
      }
    }, {
      key: 'unsubscribe',
      value: function unsubscribe(prop) {
        if (typeof prop === 'string' && this.__cb[prop]) {
          this.__cb[prop] = null;
          return true;
        }
        return false;
      }
    }]);

    return SaphirObject;
  })();

  // MODULE
  var saphir = {
    createObservable: function createObservable(model) {
      var observable = undefined;

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
  var root = this;

  /* istanbul ignore next */
  if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) {
    module.exports = saphir;
  } else {
    if (typeof define === 'function' && define.amd) {
      define('saphir', [], function () {
        return saphir;
      });
    } else {
      root.saphir = saphir;
    }
  }
}).call(this);