# ely [![npm version](https://img.shields.io/npm/v/ely.svg?style=flat)](https://www.npmjs.com/package/ely) [![Build Status](https://img.shields.io/travis/ranapat/ely/master.svg?style=flat)](https://travis-ci.org/ranapat/ely)
ely - Emit Light and Yell

### Make any object parameters emittable

#### Examples:

##### Simple emi
```javascript
import { ely } from 'ely';

const object = {
  a: 'value of a',
  b: 'value of b'
};

const emitter = ely.map(object);
emitter.on('a', (_new, _old) => {
  console.log(_new, _old);
});
emitter.on('*', (_new, _old, key) => {
  console.log(_new, _old, key);
});

object.a = 'new value of a';
object.a = 'new value of b';

```

#### More examples

[Check out use.ely](http://github.com/ranapat/use.ely)