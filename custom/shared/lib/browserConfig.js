import Bowser from 'bowser';

export const isAndroidChrome = (browserName = null) => {
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
  /**
   * Safari stopped reporting its version when running in a WebView on iOS15 an above.
   * In this case we can fallback to the OS version, since Safari on iOS
   * _usually_ matches the OS version anyway (not necessarily the patch version).
   * This avoids trying to destructure from undefined, which would result in a client exception.
   * See https://github.com/lancedikson/bowser/issues/499
   */
  const version = browser?.browser?.version ?? browser?.os?.version;
  const [major] = version?.split('.').map((n) => parseInt(n, 10));
  if (!major) return browser?.browser?.name === 'Safari';
  return (
    browser?.browser?.name === 'Safari' &&
    major >= minVersion &&
    major <= maxVersion
  );
};
