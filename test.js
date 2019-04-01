import raf from 'raf';
import easydoesit from './index';

raf.polyfill();

test('defers the invocation of the original function till the next animation frame', (done) => {
  expect.assertions(2);

  const func = jest.fn();

  const debounced = easydoesit(func);

  debounced();

  expect(func).not.toHaveBeenCalled();

  raf(() => {
    expect(func).toHaveBeenCalled();
    done();
  });
});

test('subsequent calls return the result of the last invocation', (done) => {
  expect.assertions(1);

  let result = 0;

  const func = jest.fn(() => ++result);

  const debounced = easydoesit(func);

  debounced();

  raf(() => {
    expect([
      debounced(),
      debounced()
    ]).toEqual([
      1,
      1
    ]);

    done();
  });
});

test('invokes the function with the most recent args', (done) => {
  expect.assertions(1);

  const func = jest.fn();

  const debounced = easydoesit(func);

  debounced(1);
  debounced(2);

  raf(() => {
    expect(func).lastCalledWith(2);
    done();
  });
});

test('flush() calls the original function immediately, cancelling invocation on the next frame', (done) => {
  expect.assertions(2);

  const func = jest.fn();

  const debounced = easydoesit(func);

  debounced.flush();

  expect(func).toHaveBeenCalledTimes(1);

  raf(() => {
    expect(func).toHaveBeenCalledTimes(1);
    done();
  });
});

test('flush() returns the value the original function has returned', () => {
  expect.assertions(1);

  const debounced = easydoesit(() => 'value');

  expect(debounced.flush()).toBe('value');
});

test('allows to cancel() the invocation planned for the next frame', (done) => {
  expect.assertions(1);

  const func = jest.fn();

  const debounced = easydoesit(func);

  debounced.cancel();

  raf(() => {
    expect(func).not.toHaveBeenCalled();
    done();
  });
});
