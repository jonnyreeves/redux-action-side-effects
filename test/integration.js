import { expect } from 'chai';
import { processSideEffects, withSideEffects } from '../src/index.js';
import { applyMiddleware, createStore, compose } from 'redux';

describe('redux-action-side-effects', () => {

  it('should invoke side effects on actions after they have been reduced', (done) => {
    const testState = [];
    const { store, exampleAction } = createExampleStore(msg => testState.push(msg));
    let errorThrown;

    store.dispatch(exampleAction());

    setTimeout(() => {
      try {
        expect(testState).to.deep.equal([
          'after-sideEffectClientMiddleware-called-next',
          'action-reduced',
          'side-effect-invoked'
        ]);
      }
      catch (e) {
        errorThrown = e;
      }
      finally {
        done(errorThrown);
      }
    }, 20);
  });

});

function createExampleStore(testSpy) {

  const EXAMPLE_ACTION = 'integ/EXAMPLE_ACTION';

  function exampleAction() {
    return {
      type: EXAMPLE_ACTION
    };
  }

  function reducer(state, action) {
    if (action.type === EXAMPLE_ACTION) {
      testSpy('action-reduced');
    }
    return {};
  }

  // delayMiddleware is a redux middleware which defers actions
  // from being passed to the next middleware for 10ms.
  function delayMiddleware() {
    return next => action => setTimeout(() => next(action), 10);
  }

  // sideEffectClientMiddleware is a redux middleware which tags
  // actions with sideEffects as they pass through.
  function sifeEffectClientMiddleare() {
    return next => action => {
      next(withSideEffects(action, () => {
        testSpy('side-effect-invoked');
      }));

      // best the next middleware in the chain (delayMiddleware) defers
      // the action, it will not have been reduced here.
      testSpy('after-sideEffectClientMiddleware-called-next');
    };
  }

  const store = compose(
    applyMiddleware(
      sifeEffectClientMiddleare,
      delayMiddleware
    ),
    processSideEffects
  )(createStore)(reducer);

  return { store, exampleAction };
}
