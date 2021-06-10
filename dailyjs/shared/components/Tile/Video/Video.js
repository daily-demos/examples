import React, { forwardRef, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { shallowEqualObjects } from 'shallow-equal';

export const Video = memo(
  forwardRef(({ videoTrack, ...rest }, videoEl) => {
    /**
     * Effect: mount source
     */
    useEffect(() => {
      if (!videoEl?.current) return;
      // eslint-disable-next-line no-param-reassign
      videoEl.current.srcObject = new MediaStream([videoTrack]);
    }, [videoEl, videoTrack]);

    /**
     * Effect: unmount
     */
    useEffect(
      () => () => {
        if (videoEl?.current?.srcObject) {
          videoEl.current.srcObject.getVideoTracks().forEach((t) => t.stop());
          // eslint-disable-next-line no-param-reassign
          videoEl.current.srcObject = null;
        }
      },
      [videoEl]
    );

    return <video autoPlay muted playsInline ref={videoEl} {...rest} />;
  }),
  (p, n) => shallowEqualObjects(p, n)
);

Video.propTypes = {
  videoTrack: PropTypes.any,
  mirrored: PropTypes.bool,
};

export default Video;
