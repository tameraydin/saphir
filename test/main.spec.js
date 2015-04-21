if (typeof Saphir === 'undefined') {
  var Saphir = require('../src/main.js');
}

var module;

describe('saphir', function() {

  describe('itself', function() {
    beforeEach(function() {
      module = new Saphir();
    });

    it('should work', function() {
      expect(module.getName()).toBe('saphir');
    });
  });
});
