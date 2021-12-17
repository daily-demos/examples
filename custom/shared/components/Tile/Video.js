import React, { useMemo, forwardRef, memo, useEffect, useState } from 'react';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { isScreenId } from '@custom/shared/contexts/participantsState';
import Bowser from 'bowser';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { shallowEqualObjects } from 'shallow-equal';
import { useDeepCompareMemo } from 'use-deep-compare';

export const Video = memo(
  forwardRef(({ fit = 'contain', participantId, videoTrack, ...rest }, videoEl) => {
    const { callObject } = useCallState();
    const { isMobile } = useUIState();

    const isLocalCam = useMemo(() => {
      const localParticipant = callObject.participants()?.local;
      return participantId === localParticipant.session_id && !isScreenId(participantId);
    }, [callObject, participantId]);

    const [isMirrored, setIsMirrored] = useState(isLocalCam);

    /**
     * Considered as playable video:
     * - local cam feed
     * - any screen share
     * - remote cam feed that is subscribed and reported as playable
     */
    const isPlayable = useDeepCompareMemo(
      () => isLocalCam || isScreenId(participantId),
      [isLocalCam, isScreenId(participantId)]
    );

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
     * Determine if video needs to be mirrored.
     */
    useEffect(() => {
      if (!videoTrack) return;

      const videoTrackSettings = videoTrack.getSettings();
      const isUsersFrontCamera =
        'facingMode' in videoTrackSettings
          ? isLocalCam && videoTrackSettings.facingMode === 'user'
          : isLocalCam;
      // only apply mirror effect to user facing camera
      if (isMirrored !== isUsersFrontCamera) {
        setIsMirrored(isUsersFrontCamera);
      }
    }, [isMirrored, isLocalCam, videoTrack]);

    /**
     * Handle canplay & picture-in-picture events.
     */
    useEffect(() => {
      const video = videoEl.current;
      if (!video) return;
      const handleCanPlay = () => {
        if (!video.paused) return;
        video.play();
      };
      const handleEnterPIP = () => {
        video.style.transform = 'scale(1)';
      };
      const handleLeavePIP = () => {
        video.style.transform = '';
        setTimeout(() => {
          if (video.paused) video.play();
        }, 100);
      };
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('enterpictureinpicture', handleEnterPIP);
      video.addEventListener('leavepictureinpicture', handleLeavePIP);
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('enterpictureinpicture', handleEnterPIP);
        video.removeEventListener('leavepictureinpicture', handleLeavePIP);
      };
    }, [isChrome92, videoEl]);

    /**
     * Update srcObject.
     */
    useEffect(() => {
      const video = videoEl.current;
      if (!video || !videoTrack) return;
      video.srcObject = new MediaStream([videoTrack]);
      if (isChrome92) video.load();
      return () => {
        // clean up when unmounted
        video.srcObject = null;
        if (isChrome92) video.load();
      };
    }, [isChrome92, participantId, videoEl, videoTrack, videoTrack?.id]);

      return (
        <>
          <video
            className={classNames(fit, {
              isMirrored,
              isMobile,
              playable: isPlayable && videoTrack?.enabled,
            })}
            autoPlay
            muted
            playsInline
            ref={videoEl}
            {...props}
          />
          <style jsx>{`
          video {
            opacity: 0;
          }
          video.playable {
            opacity: 1;
          }
          video.isMirrored {
            transform: scale(-1, 1);
          }
          video.isMobile {
            border-radius: 4px;
            display: block;
            height: 100%;
            position: relative;
            width: 100%;
          }
          video:not(.isMobile) {
            height: calc(100% + 4px);
            left: -2px;
            object-position: center;
            position: absolute;
            top: -2px;
            width: calc(100% + 4px);
          }
          video.contain {
            object-fit: contain;
          }
          video.cover {
            object-fit: cover;
          }
        `}</style>
        </>
      );
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
