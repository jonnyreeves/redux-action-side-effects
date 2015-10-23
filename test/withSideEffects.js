import { expect } from 'chai';
import withSideEffects from '../src/withSideEffects';

describe('withSideEffects', () => {

  function newAction(action) {
    return {
      type: 'my_action',
      ...action
    };
  }

  it('should not modify the supplied action', () => {
    const action = newAction();
    const result = withSideEffects(action, () => undefined);

    expect(result).not.to.deep.equal(action);
  });

  it('should return a new action with the supplied sideEffect', () => {
    const action = newAction();
    const expectedSideEffect = () => undefined;

    const result = withSideEffects(action, expectedSideEffect);

    expect(result).to.deep.equal({
      type: 'my_action',
      meta: {
        sideEffects: [
          expectedSideEffect
        ]
      }
    });
  });

  it('should add multiple side effects in one go', () => {
    const action = newAction();
    const first = () => undefined;
    const second = () => undefined;

    const result = withSideEffects(action, first, second);

    expect(result).to.deep.equal({
      type: 'my_action',
      meta: {
        sideEffects: [
          first,
          second
        ]
      }
    });
  });

  it('should not overwrite existing sideEffects', () => {
    const originalSideEffect = () => undefined;
    const newSideEffect = () => undefined;

    const actionwithSideEffectss = newAction({
      meta: {
        sideEffects: [ originalSideEffect ]
      }
    });

    const result = withSideEffects(actionwithSideEffectss, newSideEffect);

    expect(result).to.deep.equal({
      type: 'my_action',
      meta: {
        sideEffects: [
          originalSideEffect,
          newSideEffect
        ]
      }
    });
  });
});
