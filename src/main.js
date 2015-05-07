(function() {
  'use strict';

  class SaphirObject {
    observe(prop, callback) {
      console.log(prop, callback);
      return true;
    }

    forget() {
      return true;
    }

    getNative() {
      return true;
    }
  }

  class SaphirArray {
    observe() {
      return true;
    }
  }

  // MODULE
  let saphir = {
    createObservable: function(model) {
      let observable = model instanceof Array ?
        new SaphirArray(model) : new SaphirObject(model);

      Object.defineProperty(
        observable,
        '__callbacks',
        {
          get() {
            return 1;
          },
          set() {
            return 2;
          }
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
            get() {
              return value;
            },
            set(newValue) {
              if (newValue !== value) {
                value = newValue;
              }
            }
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
