/**
 * saphir v0.1.0 (https://github.com/tameraydin/saphir)
 * Copyright 2015 Tamer Aydin (http://tamerayd.in)
 * Licensed under MIT
 */
var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

(function () {
  'use strict';

  function _isSaphirObject(value) {
    return value instanceof SaphirObject || value instanceof SaphirArray;
  }

  function _isObject(value) {
    return value instanceof Object && Object.getPrototypeOf(value) === Object.prototype;
  }

  function getArrayDescriptor(observable, key) {
    return {
      enumerable: true,
      configurable: true,
      get: function get() {
        return observable.__value[key];
      },
      set: function set(newValue) {
        if (newValue !== observable.__value[key]) {
          var oldValue = observable.__value[key];

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
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (newValue !== value) {
          var oldValue = value;

          value = saphir.createObservable(newValue);
          if (callbacks[key]) {
            callbacks[key](value, oldValue);
          }
        }
      }
    };
  }

  var SaphirArrayBase = function SaphirArrayBase() {};
  SaphirArrayBase.prototype = {};

  function getArrDescriptor(prop) {
    return function () {
      Array.prototype[prop].apply(this.__value, arguments);
      _updateKeys(this);
    };
  }

  var arrayProps = Object.getOwnPropertyNames(Array.prototype);
  for (var i = 0; i < arrayProps.length; i++) {
    var prop = arrayProps[i];

    if (typeof Array.prototype[prop] === 'function') {
      Object.defineProperty(SaphirArrayBase.prototype, prop, {
        value: getArrDescriptor(prop)
      });
    }
  }

  function _updateKeys(model) {
    var value = undefined;
    for (var key in model.__value) {
      value = saphir.createObservable(model.__value[key]);

      Object.defineProperty(model, key, getArrayDescriptor(model, key));
    }
  }

  var SaphirArray = (function (_SaphirArrayBase) {
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

      var value = undefined;
      for (var key in model) {
        value = saphir.createObservable(model[key]);
        this.__value[key] = value;

        Object.defineProperty(this, key, getArrayDescriptor(this, key));
      }

      Object.defineProperty(this, 'length', {
        get: function get() {
          return this.__value.length;
        }
      });
    }

    _inherits(SaphirArray, _SaphirArrayBase);

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
  })(SaphirArrayBase);

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

        Object.defineProperty(this, key, getObjectDescriptor(value, this.__cb, key));
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