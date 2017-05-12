import chai from 'chai';
import chai_spies from 'chai-spies';
import { expect } from 'chai';
import { ely, Patterns } from '../../src';

describe('Test Ely', () => {
  chai.use(chai_spies);

  it('to mapIn object', () => {
    const object = {
      a: 'value of a',
      b: 'value of b'
    };

    const emitter = ely.mapIn(object);
    expect(emitter).to.equal(object.ely);
  });

  it('to mapOut object', () => {
    const object = {
      a: 'value of a',
      b: 'value of b'
    };

    const emitter = ely.mapOut(object);
    expect(object.ely).to.equal(undefined);
  });

  it('to mapIn object multiple times', () => {
    const object = {
      a: 'value of a',
      b: 'value of b'
    };

    const emitter1 = ely.mapIn(object);
    expect(emitter1).to.equal(object.ely);
    const emitter2 = ely.mapIn(object);
    expect(emitter2).to.equal(object.ely);
    expect(emitter1).to.equal(emitter2);
  });

  it('to mapOut object multiple times', () => {
    const object = {
      a: 'value of a',
      b: 'value of b'
    };

    const emitter1 = ely.mapOut(object);
    const emitter2 = ely.mapOut(object);
    expect(emitter1).not.to.equal(emitter2);
  });

  it('to map object and emit (1)', (done) => {
    const object = {
      a: 'value of a',
      b: 'value of b'
    };

    const emitter = ely.map(object);
    expect(emitter).to.equal(object.ely);
    emitter.on('*', (_new, _old, key) => {
      expect(_new).to.equal('new value of a');
      expect(_old).to.equal('value of a');
      expect(key).to.equal('a');
      done();
    });
    object.a = 'new value of a';
  });

  it('to map object and emit (2)', (done) => {
    const object = {
      a: 'value of a',
      b: 'value of b'
    };

    const emitter = ely.map(object);
    expect(emitter).to.equal(object.ely);
    emitter.on('a', (_new, _old) => {
      expect(_new).to.equal('new value of a');
      expect(_old).to.equal('value of a');
      done();
    });
    object.a = 'new value of a';
  });

  it('to map class and emit', (done) => {
    const object = new (class {
      constructor(a, b) {
        this.a = a;
        this.b = b;
      }
    })('value of a', 'value of b');

    const emitter = ely.map(object);
    expect(emitter).to.equal(object.ely);
    emitter.on('*', (_new, _old, key) => {
      expect(_new).to.equal('new value of a');
      expect(_old).to.equal('value of a');
      expect(key).to.equal('a');
      done();
    });
    object.valueOfA = 'new value of a';
    object.a = 'new value of a';
  });

  it('to map class, skip getter and setters and emit', (done) => {
    const object = new (class {
      constructor(a, b) {
        this.a = a;
        this.b = b;
      }

      get valueOfA() {
        return this.a;
      }

      set valueOfA(value) {
        this.a = value;
      }
    })('value of a', 'value of b');

    const emitter = ely.map(object);
    expect(emitter).to.equal(object.ely);
    emitter.on('*', (_new, _old, key) => {
      expect(_new).to.equal('new value of a');
      expect(_old).to.equal('value of a');
      expect(key).to.equal('a');
      done();
    });
    expect(object.valueOfA).to.equal('value of a');
    object.valueOfA = 'new value of a';
  });

  it('to map with custom patterns (1)', (done) => {
    const object = {
      a: 'value of a',
      b: 'value of b'
    };

    const emitter = ely.map(object, false, new Patterns(/^[a]+$/, undefined, true));
    emitter.on('*', (_new, _old, key) => {
      expect(_new).to.equal('new value of a');
      expect(_old).to.equal('value of a');
      expect(key).to.equal('a');
      done();
    });
    object.b = 'new value of b';
    object.a = 'new value of a';
  });

  it('to map with custom patterns (2)', (done) => {
    const object = {
      a: 'value of a',
      b: 'value of b'
    };

    const emitter = ely.map(object, false, new Patterns(/^[a-z]+$/, /^[b]+$/, true));
    emitter.on('*', (_new, _old, key) => {
      expect(_new).to.equal('new value of a');
      expect(_old).to.equal('value of a');
      expect(key).to.equal('a');
      done();
    });
    object.b = 'new value of b';
    object.a = 'new value of a';
  });

  it('to map with custom patterns (3)', (done) => {
    const object = {
      a: 'value of a',
      b: 'value of b'
    };

    const emitter = ely.map(object, false, new Patterns([/^[a]+$/, /^[b]+$/], undefined, true));
    emitter.on('*', (_new, _old, key) => {
      expect(_new).to.equal('new value of b');
      expect(_old).to.equal('value of b');
      expect(key).to.equal('b');
      done();
    });
    object.b = 'new value of b';
  });

  it('to map with custom patterns (4)', (done) => {
    const object = {
      a: 'value of a',
      b: 'value of b'
    };

    const emitter = ely.map(object, false, new Patterns([/^[a]+$/, /^[b]+$/], /^[b]+$/, true));
    emitter.on('*', (_new, _old, key) => {
      expect(_new).to.equal('new value of a');
      expect(_old).to.equal('value of a');
      expect(key).to.equal('a');
      done();
    });
    object.b = 'new value of b';
    object.a = 'new value of a';
  });

  it('to emit * by default', () => {
    const object = {
      a: 'value of a',
      b: 'value of b'
    };
    const onStar = chai.spy((self) => {});
    const onA = chai.spy((self) => {});

    const emitter = ely.map(object);
    emitter.on('*', onStar);
    emitter.on('a', onA);

    object.a = 'new value of a';

    expect(onStar).to.have.been.called();
    expect(onA).to.have.been.called();
  });

  it('to not emit * if needed', () => {
    const object = {
      a: 'value of a',
      b: 'value of b'
    };
    const onStar = chai.spy((self) => {});
    const onA = chai.spy((self) => {});

    const emitter = ely.map(object, false, new Patterns(undefined, undefined, false));
    emitter.on('*', onStar);
    emitter.on('a', onA);

    object.a = 'new value of a';

    expect(onStar).not.to.have.been.called();
    expect(onA).to.have.been.called();
  });

  it('to not create ely if ely exists', () => {
    const object = {
      a: 'value of a',
      b: 'value of b',
      ely: 'ely yells'
    };

    const emitter = ely.map(object, true, new Patterns(undefined, undefined, true));
    expect(object.ely).to.equal('ely yells');
  });

  it('to not map already mapped methods', () => {
    const object = {
      a: 'value of a',
      b: 'value of b'
    };
    const onStar = chai.spy((self) => {});

    ely.map(object, true, new Patterns(undefined, undefined, true));
    ely.map(object, true, new Patterns(undefined, undefined, true));
    ely.map(object, true, new Patterns(undefined, undefined, true));
    object.ely.on('*', onStar);

    object.a = 'new value of a';

    expect(onStar).to.have.been.called().once;
  });

  it('to find free ely map (1)', () => {
    const object = {
      a: 'value of a',
      b: 'value of b'
    };

    ely.map(object);

    expect(object.__ely_map__).not.to.equal(undefined);
  });

  it('to find free ely map (1)', () => {
    const object = {
      a: 'value of a',
      b: 'value of b',
      __ely_map__: 'this is ely map'
    };

    ely.map(object);

    expect(object.__ely_map__).to.equal('this is ely map');
    expect(object.___ely_map___).not.to.equal(undefined);
  });

});
