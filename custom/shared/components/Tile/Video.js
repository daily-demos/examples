import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Bowser from 'bowser';
import classNames from 'classnames';

import { useCallState } from '../../contexts/CallProvider';
import { useUIState } from '../../contexts/UIStateProvider';
import { useVideoTrack } from '../../hooks/useVideoTrack';

export const Video = forwardRef(
  (
    { fit = 'contain', isScreen = false, participantId, ...props },
    videoEl
  ) => {
    const { callObject: daily } = useCallState();
    const { isMobile } = useUIState();
    const isLocalCam = useMemo(() => {
      const localParticipant = daily.participants()?.local;
      return participantId === localParticipant.session_id && !isScreen;
    }, [daily, isScreen, participantId]);
    const [isMirrored, setIsMirrored] = useState(isLocalCam);
    const videoTrack = useVideoTrack(participantId);

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
            playable: videoTrack?.enabled,
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
  }
);
Video.displayName = 'Video';