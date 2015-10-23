# redux-action-side-effects
> Trigger side effects after actions have been reduced.

```
npm install --save redux-action-side-effects
```

## What's a side effect?
A side effect is a function which is invoked as a result of an action being reduced.

```js
import { withSideEffects } from 'redux-action-side-effects';

// Create an action as per usual.
const action = someAction();

// Tag it with a side-effect. Note that a new action is returned; the original
// action is not mutated.
const actionWithSideEffect = withSideEffects(
  action,
  () => console.log('action reduced!')
);
```

## Motivation
Sometimes you need to invoke logic after the store's state has been modified (typically in stateful middleware).  As middleware can be asynchronous, it may cause issues to depend on the following pattern as there is no guarantee that the next piece of middleware will have not have deferred, or detained the action.

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
Side effects are store in an action's `meta.sideEffects` property as an Array of functions.  Each side effect is invoked in order.
