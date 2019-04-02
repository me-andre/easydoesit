easydoesit
==========
Makes a function run no more than once per animation frame

[![NPM](https://img.shields.io/npm/v/easydoesit.svg)](https://www.npmjs.com/package/easydoesit)
[![Build Status](https://travis-ci.org/me-andre/easydoesit.svg?branch=master)](https://travis-ci.org/me-andre/easydoesit)

### TL;DR

```
npm install --save easydoesit
```
if you use `yarn`
```
yarn add easydoesit
```
Then in your code:
```
import easydoesit from 'easydoesit';

const heavyAnimation = () => {}; // a function you'd rather not call more than once per animation frame
const debouncedAnimation = easydoesit(heavyAnimation);

// e.g.
document.documentElement.addEventListener('touchmove', debouncedAnimation);
// now even if you're gonna make some chaos on the screen,
// heavyAnimation() won't be invoked more frequently
// than the browser is about to redraw the page
// YAY!
```
Borrowing a contract from `lodash.debounce`, the function returned by `easydoesit()` has 2 extra methods on it:
1. `flush()` invokes the underlying function immediately, cancelling the invocation planned for the next frame.
It returns whatever the original function has returned.
Note that if the debounced function gets called before the next animation frame, it will be rescheduled again.
2. `cancel()` skips the invocation planned for the next frame.
The same note about rescheduling is valid for `cancel()` too.

---

### Rationale

Sometimes, when you animate a component in response to a user event, like moving a draggable element around the screen
you may want to throttle down its position update to save resources, especially if your component is heavy to render.
If you move the mouse (or finger) fast enough, move events may occur more frequently than browser repaints the screen,
so by updating the position of our draggable component in response to each move event (1 move = 1px)
we may waste resources on unneeded renders that a user won’t see.

Fortunately an instrument exists to postpone some work until the browser is about to redraw the screen.
Most of us are already familiar with the `window.requestAnimationFrame` method.
So in order to address the problem of reducing the frequency of updates we need to take the following steps:
1. store cursor position in a touchmove or mousemove event handler
2. apply the latest stored position inside a recurring  requestAnimationFrame callback

The idea is simple: collect position updates as frequently as possible,
but apply them only before a redraw is about to happen.
Imagine the following event sequence:
1. touchmove to `{ x: 1, y: 1 }`
2. touchmove to `{ x: 2, y: 1 }`
3. touchmove to `{ x: 3, y: 1 }`
4. A redraw is about to happen, so browser calls `requestAnimationFrame` callbacks
5. We apply the most recent position `{ x: 3, y: 1 }` to the element
6. Redraw happened! Go to #1

#### How it relates to debounce and throttle

The technique may have already reminded you of the `debounce` function that most of us are well used to.
Actually it’s a combination of `debounce` and `throttle`:
1. Our intent is to limit the frequency the function gets called, so it’s similar to `throttle`.
2. But unlike with `throttle`, we don’t base our throttling on timing
   because we can’t foresee when animation frames are gonna happen.
3. Instead what we do it “eating up” all calls to the function,
   postponing its actual invocation until the next animation frame.
   That is what makes this technique similar to `debounce`.

<details>
<summary>Relation with raf-throttle</summary>
Regardless of whether we call this solution debouncing or throttling, there’s one important thing to it:
when the function is invoked, we need the most recent args among those received at the moment,
or otherwise the function would produce an "outdated" result. In my "drag and drop" example, the position of the element
would lag behind the actual cursor movement.
Calling the original function with the most recent args is exactly what the existing solution <code>raf-throttle</code>
did <strong>NOT</strong> do at the moment I wrote this code.
After my pull requests to <code>raf-throttle</code> have been stale for a while,
I decided to publish my own library that addresses the same issue.
</details>
