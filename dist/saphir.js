/**
 * saphir v0.1.0 (https://github.com/tameraydin/saphir)
 * Copyright 2015 Tamer Aydin (http://tamerayd.in)
 * Licensed under MIT
 */
(function () {
  'use strict';

  // MODULE
  var Saphir = function Saphir() {
    this.name = 'saphir';
  };

  Saphir.prototype = {
    getName: function getName() {
      return this.name;
    }
  };

  // EXPORT
  var root = this;

  /* istanbul ignore next */
  if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) {
    module.exports = Saphir;
  } else {
    if (typeof define === 'function' && define.amd) {
      define('Saphir', [], function () {
        return Saphir;
      });
    } else {
      root.Saphir = Saphir;
    }
  }
}).call(this);