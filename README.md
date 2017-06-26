# ely [![npm version](https://img.shields.io/npm/v/ely.svg?style=flat)](https://www.npmjs.com/package/ely) [![Build Status](https://img.shields.io/travis/ranapat/ely/master.svg?style=flat)](https://travis-ci.org/ranapat/ely)  [![Coverage Status](https://coveralls.io/repos/ranapat/ely/badge.svg?branch=master)](https://coveralls.io/r/ranapat/elyf?branch=master)

ely - Emit Light and Yell

## Make any object parameters emittable

Make listening for changes easier with automatic property change emitter.

### Install:

#### Install with npm
```bash
npm install ely
```

#### Use standalone
```html
<script src="https://cdn.jsdelivr.net/npm/tasksf/standalone/ely.js"></script>
or
<script src="https://cdn.jsdelivr.net/npm/tasksf/standalone/ely.min.js"></script>
```

### Access the library:

#### Import
```javascript
import { ely } from 'ely';
```

#### Require
```javascript
const ely = require('ely');
```

#### Standalone
```html
<script src="https://cdn.jsdelivr.net/npm/tasksf/standalone/ely.min.js"></script>
<script>
// global ely variable exists
</script>
```

### Basics:

#### ely static

Ely library provides a static library to map and unmap objects.
Map returns emitter with signals named as every property that can be
monitored. Also you have '*' to monitor all changes within a single place.

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
object.b = 'new value of b';

```

### More examples

[Check the examples](http://github.com/ranapat/ely/blob/master/examples/src)

### Documentation

[Check the documentation](http://github.com/ranapat/ely/blob/master/docs/docs.md)

### What is next

[Check the todo](http://github.com/ranapat/ely/blob/master/TODO.md)

### What have changed

[Check the changelog](http://github.com/ranapat/ely/blob/master/CHANGELOG.md)
