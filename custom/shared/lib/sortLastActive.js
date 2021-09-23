export const sortLastActive = (a, b) => {
  if (a?.lastActiveDate > b?.lastActiveDate) return -1;
  if (a?.lastActiveDate < b?.lastActiveDate) return 1;
  return 0;
};

export default sortLastActive;
