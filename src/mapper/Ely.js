import EventEmitter from 'events';

import Patterns from './Patterns';
import StorageMap from './StorageMap';

/**
 * Ely
 *
 * Maps and unmaps object properties to emitter.
 * Every further change of properties will emit the changes.
 *
 * Can keep the emitter inside or outside of the original object.
 */
class Ely {
  /**
   * Maps and keeps emitter inside the object
   *
   * Shortkey for map(object, true, patterns)
   *
   * @param {Object} object object with properties
   * @param {Patterns} patterns patterns of matching
   * @return {EventEmitter} event emitter
   */
  static mapIn(object, patterns = undefined) {
    return Ely.map(object, true, patterns);
  }

  /**
   * Maps and keeps emitter outside the object
   *
   * Shortkey for map(object, false, patterns)
   *
   * @param {Object} object object with properties
   * @param {Patterns} patterns patterns of matching
   * @return {EventEmitter} event emitter
   */
  static mapOut(object, patterns = undefined) {
    return Ely.map(object, false, patterns);
  }

  /**
   * Maps object properties
   *
   * Main map method
   *
   * @param {Object} object object with properties
   * @param {boolean} embed embed the emitter or not
   * @param {Patterns} patterns patterns of matching
   * @return {EventEmitter} event emitter
   */
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

  /**
   * Unmaps object properties
   *
   * @param {Object} object object with properties
   */
  static unmap(object) {
    const elyMapKey = Ely.findElyMapKey(object);
    const elyMap = object[elyMapKey];

    if (elyMap !== undefined) {
      Object.keys(elyMap.map).forEach((key) => {
        Object.defineProperty(object, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: elyMap.values[elyMap.map[key]]
        });
      });

      delete object[elyMapKey];
      if (object['ely'] !== undefined && object['ely'] instanceof EventEmitter) {
        delete object['ely'];
      }
    }
  }

  /**
   * Gets default pattern
   *
   * @return {Patterns} default patterns
   */
  static get defaultPatterns() {
    return new Patterns(
      undefined,
      /^_.*$/,
      true
    );
  }

  /**
   * Finds the ely map key
   *
   * Checks if default ely map key already exists and replaces
   * it with unique one.
   *
   * @param {Object} object object with properties
   * @return {string}
   * @protected
   */
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

  /**
   * Finds empty key
   *
   * Checks if key overlap inside object. Creates unique one if needed.
   *
   * @param {Object} object object with properties
   * @param {string} key key to be checked
   * @param {string} prefix prefix to be applied
   * @return {string} unique key
   * @protected
   */
  static findEmptyKey(object, key, prefix) {
    let name = key;
    while (object[name] !== undefined) {
      name = prefix + name;
    }
    return name;
  }

  /**
   * Matches key to pattern
   *
   * Checks if key matches a given pattern
   *
   * @param {string} key key to be checked
   * @param {Patterns} patterns patterns to check against
   * @return {boolean} match result
   * @protected
   */
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

  /**
   * No Matches key to pattern
   *
   * Checks if key does not match a given pattern
   *
   * @param {string} key key to be checked
   * @param {Patterns} patterns patterns to check against
   * @return {boolean} match result
   * @protected
   */
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
