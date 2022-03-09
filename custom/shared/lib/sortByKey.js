export const sortByKey =
  (key, caseSensitive = true) =>
  (a, b) => {
    const aKey =
      !caseSensitive && typeof a[key] === 'string'
        ? String(a[key])?.toLowerCase()
        : a[key];
    const bKey =
      !caseSensitive && typeof b[key] === 'string'
        ? String(b[key])?.toLowerCase()
        : b[key];
    if (aKey > bKey) return 1;
    if (aKey < bKey) return -1;
    return 0;
  };
