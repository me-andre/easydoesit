export default (func) => {
  let requestId = null;
  let context;
  let lastArgs;
  let result;

  const invoke = () => {
    requestId = null;
    result = func.apply(context, lastArgs);
  };

  const debounced = function(...args) {
    context = this;
    lastArgs = args;
    if (requestId === null) {
      requestId = requestAnimationFrame(invoke);
    }
    return result;
  };
  
  const cancel = () => {
    cancelAnimationFrame(requestId);
    requestId = null;
  };

  debounced.cancel = cancel;

  debounced.flush = () => {
    cancel();
    invoke();
    return result;
  };

  return debounced;
};
