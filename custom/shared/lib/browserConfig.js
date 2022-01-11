import Bowser from 'bowser';

export const isAndroidChrome = (browserName) => {
  const browser = Bowser.parse(navigator.userAgent);
  const name = browserName ?? browser?.browser?.name;
  return (
    name === 'Chrome' &&
    browser?.platform?.type === 'mobile' &&
    browser?.os?.name === 'Android'
  );
};

export const isIOSMobile = () => {
  const browser = Bowser.parse(navigator.userAgent);
  return (
    browser.platform?.vendor === 'Apple' &&
    navigator.maxTouchPoints > 0 &&
    typeof TouchEvent !== 'undefined'
  );
};

export const isSafari = (minVersion = 1, maxVersion = 100) => {
  const browser = Bowser.parse(navigator.userAgent);
  const [major] = browser?.browser?.version
    ?.split('.')
    .map((n) => parseInt(n, 10));
  if (!major) return browser?.browser?.name === 'Safari';
  return (
    browser?.browser?.name === 'Safari' &&
    major >= minVersion &&
    major <= maxVersion
  );
};