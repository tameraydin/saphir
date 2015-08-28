# Saphir [![Build Status](http://img.shields.io/travis/tameraydin/saphir/master.svg?style=flat-square)](https://travis-ci.org/tameraydin/saphir) [![Coverage Status](https://img.shields.io/coveralls/tameraydin/saphir/master.svg?style=flat-square)](https://coveralls.io/r/tameraydin/saphir?branch=master)

A small library that helps to observe defined Object/Array properties.

```bash
npm install saphir
# or
bower install saphir
```

```javascript
var observableObj = new SaphirObject(
  {a: 'foo'}
);

observableObj._subscribe('a', function(newValue, oldValue) {
  console.log(oldValue + ' => ' + newValue);
});

observableObj.a = 'bar';
// foo => bar

var observableArr = new SaphirArray([1, 3, 2]);

observableArr._subscribe(function(newValue) {
  console.log(newValue);
});

observableArr[0] = 4;
// [4, 3, 2]
observableArr.push(1);
// [4, 2, 3, 1]
```

#### TODO
- [ ] multi subscription
- [ ] more benchmarks
