/**
 * processSideEffects is a redux store enhancer which will invoke one or more
 * functions provided in an FSA's `meta.sideEffects` Array after the action has
 * been reduced.
 *
 * Because redux store enhancers can potentially make reduction asynchronous, this
 * should be the last store enhancer in the composition chain.
 *
 * @param {Function} next Redux's `createStore` function, or the next store enhancer
 *                        in the composition chain
 * @returns {Function} A store enhancer which processes an action's side effects
 */
export default function processSideEffects(next) {
  return (reducer, initialState) => {
    let lastAction;

    // custom reducer which records actions as they pass through.
    let store = next((state, action) => {
      lastAction = action;
      return reducer(state, action);
    }, initialState);

    // trigger side-effects on the next store update.
    store.subscribe(() => {
      const { meta: { sideEffects } = {} } = lastAction;

      if (Array.isArray(sideEffects)) {
        sideEffects.concat().forEach(sideEffect => (typeof sideEffect === 'function') ? sideEffect(store.dispatch) : store.dispatch(sideEffect));
      }
    });

    return store;
  };
}
