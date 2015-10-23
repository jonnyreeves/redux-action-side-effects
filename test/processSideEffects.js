import chai, { expect } from 'chai';
import { createStore } from 'redux';
import processSideEffects from '../src/processSideEffects';

describe('processSideEffects', () => {

  let nextStore;
  let nextStoreDispatchSpy;
  let enhancedStore;

  beforeEach(() => {

    // createSpyStore wraps redux's createStore method to return an instrumented
    // store
    const createSpyStore = (reducer, initialState) => {
      nextStore = createStore(reducer, initialState);
      nextStoreDispatchSpy = chai.spy.on(nextStore, 'dispatch');
      return nextStore;
    };

    // enhancedStore is a redux store wrapped in the processSideEffects store
    // enhancer and is our subject under test.
    enhancedStore = processSideEffects(createSpyStore)(() => {});
  });

  function newAction(action) {
    return {
      type: 'my_action',
      ...action
    };
  }

  it('should pass a dispatched action without sideEffects to the next store', () => {
    const action = newAction();

    enhancedStore.dispatch(action);

    expect(nextStoreDispatchSpy).to.have.been.called.exactly(1);
    expect(nextStoreDispatchSpy).to.have.been.called.with(action);
  });

  it('should pass a dispatched action with sideEffects to the next store', () => {
    const action = newAction({
      meta: {
        sideEffects: [ () => undefined ]
      }
    });

    enhancedStore.dispatch(action);

    expect(nextStoreDispatchSpy).to.have.been.called.exactly(1);
    expect(nextStoreDispatchSpy).to.have.been.called.with(action);
  });

  it('should execute an action\'s sideEffects after the store has updated', (done) => {
    const sideEffectSpy = chai.spy();

    const action = newAction({
      meta: {
        sideEffects: [ sideEffectSpy ]
      }
    });

    enhancedStore.dispatch(action);

    setTimeout(() => {
      try {
        expect(sideEffectSpy).to.have.been.called.exactly(1);
        done();
      }
      catch(e) {
        done(e);
      }
    }, 0);

  });

  it('should execute all of the action\'s sideEffects', (done) => {
    const firstSideEffectSpy = chai.spy();
    const secondSideEffectSpy = chai.spy();

    const action = newAction({
      meta: {
        sideEffects: [ firstSideEffectSpy, secondSideEffectSpy ]
      }
    });

    enhancedStore.dispatch(action);

    setTimeout(() => {
      try {
        expect(firstSideEffectSpy).to.have.been.called.exactly(1);
        expect(secondSideEffectSpy).to.have.been.called.exactly(1);
        done();
      }
      catch(e) {
        done(e);
      }
    }, 0);

  });
});
