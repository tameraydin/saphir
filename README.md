# Saphir [![Build Status](http://img.shields.io/travis/tameraydin/saphir/master.svg?style=flat-square)](https://travis-ci.org/tameraydin/saphir) [![Coverage Status](https://img.shields.io/coveralls/tameraydin/saphir/master.svg?style=flat-square)](https://coveralls.io/r/tameraydin/saphir?branch=master)

[Experimental] Object/Array observation library.

```javascript
var observable = new SaphirObject(
  {a: 1}
);

observable.subscribe('a', function(newValue, oldValue) {
  console.log(oldValue + ' => ' + newValue);
});

observable.a = 2;
// 1 => 2
```

#### TODO
- [ ] multi subscription
- [ ] add/remove observation?
- [ ] more benchmarks
