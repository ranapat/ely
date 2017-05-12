import EventEmitter from 'events';

import Patterns from './Patterns';
import StorageMap from './StorageMap';

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

    const elyMapKey = Ely.findElyMapKey(object);
    const elyMap = object[elyMapKey] !== undefined ? object[elyMapKey] : new StorageMap();
    const elyMapKeys = Object.keys(elyMap.map);
    elyMapKeys.push(elyMapKey);

    const emitall = patterns !== undefined ? patterns.emitall : false;

    Object.keys(object).forEach((key) => {
      if (elyMapKeys.indexOf(key) === -1) {
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
              const privateKey = Ely.findEmptyKey(elyMap.map, key, '_');
              const value = object[key];

              Object.defineProperty(elyMap.values, privateKey, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: value
              });
              Object.defineProperty(object, key, {
                configurable: true,
                enumerable: true,
                set: (value) => {
                  emitter.emit(key, value, elyMap.values[privateKey]);
                  if (emitall) {
                    emitter.emit('*', value, elyMap.values[privateKey], key);
                  }
                  elyMap.values[privateKey] = value;
                },
                get: () => {
                  return elyMap.values[privateKey];
                }
              });

              elyMap.map[key] = privateKey;
            }
          }
        }
      }
    });

    Object.defineProperty(object, elyMapKey, {
      configurable: true,
      enumerable: false,
      writable: true,
      value: elyMap
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

  static findElyMapKey(object) {
    let name = '__ely_map__';
    while (object[name] !== undefined && !(object[name] instanceof StorageMap)) {
      name = '_' + name + '_';
    }
    if (object[name] === undefined) {
      return name;
    } else if (object[name] instanceof StorageMap) {
      return name;
    } else {
      return undefined;
    }
  }

  static findEmptyKey(object, key, prefix) {
    let name = key;
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
