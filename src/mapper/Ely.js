import EventEmitter from 'events';

import Patterns from './Patterns';

class Ely {
  static mapIn(object, patterns = undefined) {
    return Ely.map(object, true, patterns);
  }

  static mapOut(object, patterns = undefined) {
    return Ely.map(object, false, patterns);
  }

  static map(object, embed = true, patterns = undefined) {
    const defaultPatterns = Ely.defaultPatterns;
    patterns = patterns === undefined ? defaultPatterns : patterns;

    let emitter;

    if (embed) {
      if (object.ely !== undefined) {
        if (object.ely instanceof EventEmitter) {
          emitter = object.ely;
        } else {
          embed = false;
        }
      }
    }

    if (emitter === undefined) {
      emitter = new EventEmitter();
    }

    if (embed && object.ely === undefined) {
      Object.defineProperty(object, 'ely', {
        configurable: true,
        enumerable: true,
        writable: false,
        value: emitter
      });
    }

    const elyMapped = object['__ely__map__'] !== undefined ? object['__ely__map__'] : {};
    const elyMappedKeys = Object.keys(elyMapped);
    elyMappedKeys.push('__ely__map__');

    const emitall = patterns !== undefined ? patterns.emitall : false;

    Object.keys(object).forEach((key) => {
      if (elyMappedKeys.indexOf(key) === -1) {
        const descriptor = Object.getOwnPropertyDescriptor(object, key);
        if (descriptor.writable) {
          const valueType = typeof descriptor.value;
          if (
            valueType !== 'function'
          ) {
            if (
              patterns === undefined
                || (Ely.match(key, patterns.accept) && Ely.notmatch(key, patterns.skip))
            ) {
              const privateKey = Ely.findEmptyKey(object, key, '_');
              const value = object[key];

              delete object[key];
              Object.defineProperty(object, privateKey, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: value
              });
              Object.defineProperty(object, key, {
                configurable: true,
                enumerable: true,
                set: (value) => {
                  emitter.emit(key, value, object[privateKey]);
                  if (emitall) {
                    emitter.emit('*', value, object[privateKey], key);
                  }
                  object[privateKey] = value;
                },
                get: () => {
                  return object[privateKey];
                }
              });

              elyMapped[privateKey] = key;
            }
          }
        }
      }
    });

    Object.defineProperty(object, '__ely__map__', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: elyMapped
    });

    return emitter;
  }

  static get defaultPatterns() {
    return new Patterns(
      undefined,
      /^_.*$/,
      true
    );
  }

  static findEmptyKey(object, key, prefix) {
    let name = prefix + key;
    while (object[name] !== undefined) {
      name = prefix + name;
    }
    return name;
  }

  static match(key, patterns) {
    if (patterns === undefined) {
      return true;
    } else if (Array.isArray(patterns)) {
      const length = patterns.length;
      let i;
      let pass = false;
      for (i = 0; i < length; ++i) {
        const pattern = patterns[i];
        if (
          typeof pattern === 'object'
          && pattern.constructor !== undefined
          && pattern.constructor.name === 'RegExp'
        ) {
          pass = pass || pattern.test(key);
        }
      }
      return pass;
    } else if (
      typeof patterns === 'object'
      && patterns.constructor !== undefined
      && patterns.constructor.name === 'RegExp'
    ) {
      return patterns.test(key);
    } else {
      return true;
    }
  }

  static notmatch(key, patterns) {
    if (patterns === undefined) {
      return true;
    } else if (Array.isArray(patterns)) {
      const length = patterns.length;
      let i;
      let pass = false;
      for (i = 0; i < length; ++i) {
        const pattern = patterns[i];
        if (
          typeof pattern === 'object'
          && pattern.constructor !== undefined
          && pattern.constructor.name === 'RegExp'
        ) {
          pass = pass || pattern.test(key);
        }
      }
      return !pass;
    } else if (
      typeof patterns === 'object'
      && patterns.constructor !== undefined
      && patterns.constructor.name === 'RegExp'
    ) {
      return !patterns.test(key);
    } else {
      return true;
    }
  }
}

export default Ely;
