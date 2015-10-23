/**
 * withSideEffects returns a new action with the supplied side-effect which will be
 * executed after it has been reduced and the store has updated.  The supplied action
 * object will not be modified.
 *
 * @param {Object} action
 * @param {...Function} newSideEffect One or more sideEffect functions, will be invoked
 *                               with `{getState}` after the store has updated.
 */
export default function withSideEffects(action, ...newSideEffect) {
  const { meta: { sideEffects } = {} } = action;

  return {
    ...action,
    meta: {
      ...action.meta,
      sideEffects: appendSideEffect(sideEffects, newSideEffect)
    }
  };
}

function appendSideEffect(value, newSideEffect) {
  return (Array.isArray(value) ? value.concat(newSideEffect) : newSideEffect );
}
