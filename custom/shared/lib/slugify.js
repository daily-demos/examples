const convert = (keyword) => {
  return keyword
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
};

const revert = (keyword) => {
  return keyword
    .toString()
    .trim()
    .toLowerCase()
    .replace('-', ' ')
}

export const slugify = { convert, revert };