/**
 * Patterns
 *
 * Patterns for matching.
 *
 * @param {RegExp} accept regular expression for accept
 * @param {RegExp} skip regular expression for skip
 * @param {boolean} emitall emitall status
 */
class Patterns {
  /**
   * Patterns constructor
   *
   * @param {RegExp} accept regular expression for accept
   * @param {RegExp} skip regular expression for skip
   * @param {boolean} emitall emitall status
   */
  constructor(accept, skip, emitall = false) {
    this.accept = accept;
    this.skip = skip;
    this.emitall = emitall;
  }
}

export default Patterns;
