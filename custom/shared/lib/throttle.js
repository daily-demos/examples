export const throttle = (callback, limit) => {
  let wait = false;
  return (...args) => {
    if (!wait) {
      callback(...args);
      wait = true;
      setTimeout(() => {
        wait = false;
      }, limit);
    }
  };
};
