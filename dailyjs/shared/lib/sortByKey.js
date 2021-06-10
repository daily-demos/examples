export const sortByKey = (a, b, key, caseSensitive = true) => {
  const aKey =
    !caseSensitive && typeof a[key] === 'string'
      ? a[key]?.toLowerCase()
      : a[key];
  const bKey =
    !caseSensitive && typeof b[key] === 'string'
      ? b[key]?.toLowerCase()
      : b[key];
  if (aKey > bKey) return 1;
  if (aKey < bKey) return -1;
  return 0;
};

export default sortByKey;
