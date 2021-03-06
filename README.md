# redux-action-side-effects
> Trigger side effects after actions have been reduced.

```
npm install --save redux-action-side-effects
```

## What's a side effect?
A side effect is a function which is invoked or an another action which is dispatched as a result of an original action being reduced.

```js
import { withSideEffects } from 'redux-action-side-effects';

// Create an action as per usual.
const action = someAction();

// Optionally, create an action which would be dispatched after an original action being reduced.
const actionHasBeenReducedAction = someAnotherAction();

// Tag it with a side-effect. Note that a new action is returned; the original
// action is not mutated.
const actionWithSideEffect = withSideEffects(
  action,
  () => console.log('action reduced!'),
  actionHasBeenReducedAction
);
```

## Motivation
Sometimes you need to invoke logic or dispatch another action after the store's state has been modified (typically in stateful middleware).  As middleware can be asynchronous, it may cause issues to depend on the following pattern as there is no guarantee that the next piece of middleware will have not have deferred, or detained the action.

```js
function customMiddleware() {
  return next => action => {
    if (action.type === 'SOME_ACTION') {
      next(action);

      // Assume that the action has been reduced and the store updated.
      triggerSideEffect();
    }
  }
```

## Installation

```
npm install --save redux-action-side-effects
```

Then, to enable `redux-action-side-effects`, add it to your store's composition chain:

```js
import { createStore, applyMiddleware, compose } from 'redux';
import { processSideEffects } from 'redux-action-side-effects';

const store = compose(
  applyMiddleware( /* your middleware */ ),
  processSideEffects
)(createStore)(reducer);
```

`processSideEffects` should be the last store enhancer in your chain (or at least come after any store processors which delay, or detain actions) to ensure side-effects are processed after an action has been reduced.

## Implementation
Side effects are store in an action's `meta.sideEffects` property as an Array of functions.  Each side effect is invoked in order with the store's `dispatch` function which can be used to dispatch other actions.

### Example Usage
The following example shows how we can handle a common use-case example; showing a spinner whilst an API call is made and dismissing it afterwards.

```js
import { CALL_API } from 'redux-api-middleware';
import { withSideEffect } from 'redux-action-side-effects';

function fetchUser(userId) {
  return {
    [CALL_API]: {
      endpoint: `http://example.org/users/${userId}`,
      method: 'GET',
      types: [
        { type: 'SHOW_SPINNER' },
        withSideEffect(
          { type: 'FETCH_USER_SUCCESS', payload: response },
          (dispatch) => dispatch({ type: 'HIDE_SPINNER' })
        ),
        { type: 'FETCH_USER_ERROR' },
      ]
    }
  };
}
```

Same example using HIDE_SPINNER action as a plain javascript object.

```js
import { CALL_API } from 'redux-api-middleware';
import { withSideEffect } from 'redux-action-side-effects';

function fetchUser(userId) {
  return {
    [CALL_API]: {
      endpoint: `http://example.org/users/${userId}`,
      method: 'GET',
      types: [
        { type: 'SHOW_SPINNER' },
        withSideEffect(
          { type: 'FETCH_USER_SUCCESS', payload: response },
          { type: 'HIDE_SPINNER' }
        ),
        { type: 'FETCH_USER_ERROR' },
      ]
    }
  };
}
```
