const convert = (keyword) => {
  return keyword
    .toString()
    .trim()
    .replace(/\s+/g, '-')
};

const revert = (keyword) => {
  return keyword
    .toString()
    .trim()
    .replace('-', ' ')
}

export const slugify = { convert, revert };