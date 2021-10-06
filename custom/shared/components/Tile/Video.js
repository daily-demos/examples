import React, { useMemo, forwardRef, memo, useEffect } from 'react';
import Bowser from 'bowser';
import PropTypes from 'prop-types';
import { shallowEqualObjects } from 'shallow-equal';

export const Video = memo(
  forwardRef(({ participantId, videoTrack, ...rest }, videoEl) => {
    /**
     * Memo: Chrome >= 92?
     * See: https://bugs.chromium.org/p/chromium/issues/detail?id=1232649
     */
    const isChrome92 = useMemo(() => {
      const { browser, platform, os } = Bowser.parse(navigator.userAgent);
      return (
        browser.name === 'Chrome' &&
        parseInt(browser.version, 10) >= 92 &&
        (platform.type === 'desktop' || os.name === 'Android')
      );
    }, []);

    /**
     * Effect: Umount
     * Note: nullify src to ensure media object is not counted
     */
    useEffect(() => {
      const video = videoEl.current;
      if (!video) return false;
      // clean up when video renders for different participant
      video.srcObject = null;
      if (isChrome92) video.load();
      return () => {
        // clean up when unmounted
        video.srcObject = null;
        if (isChrome92) video.load();
      };
    }, [videoEl, isChrome92, participantId]);

    /**
     * Effect: mount source (and force load on Chrome)
     */
    useEffect(() => {
      const video = videoEl.current;
      if (!video || !videoTrack) return;
      video.srcObject = new MediaStream([videoTrack]);
      if (isChrome92) video.load();
    }, [videoEl, isChrome92, videoTrack]);

    return <video autoPlay muted playsInline ref={videoEl} {...rest} />;
  }),
  (p, n) => shallowEqualObjects(p, n)
);

Video.displayName = 'Video';

Video.propTypes = {
  videoTrack: PropTypes.any,
  mirrored: PropTypes.bool,
  participantId: PropTypes.string,
};

export default Video;
