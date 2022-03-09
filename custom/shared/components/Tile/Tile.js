import React, { memo, useEffect, useState, useRef, useMemo } from 'react';
import { ReactComponent as IconMicMute } from '@custom/shared/icons/mic-off-sm.svg';
import {
  useMediaTrack,
  useParticipant,
  useActiveParticipant,
  useLocalParticipant,
} from '@daily-co/daily-react-hooks';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { DEFAULT_ASPECT_RATIO } from '../../constants';
import { Video } from './Video';
import { ReactComponent as Avatar } from './avatar.svg';

const SM_TILE_MAX_WIDTH = 300;

export const Tile = memo(
  ({
    sessionId,
    isScreen = false,
    mirrored = true,
    showName = true,
    showAvatar = true,
    showActiveSpeaker = true,
    network,
    videoFit = 'contain',
    aspectRatio = DEFAULT_ASPECT_RATIO,
    onVideoResize,
    ...props
  }) => {
    const videoState = useMediaTrack(
      sessionId,
      isScreen ? 'screenVideo' : 'video'
    );

    const videoEl = useRef(null);
    const tileRef = useRef(null);

    const participant = useParticipant(sessionId);
    const activeParticipant = useActiveParticipant();
    const localParticipant = useLocalParticipant();

    const [tileAspectRatio, setTileAspectRatio] = useState(aspectRatio);
    const [tileWidth, setTileWidth] = useState(0);

    /**
     * Add optional event listener for resize event so the parent component
     * can know the video's native aspect ratio.
     */
    useEffect(() => {
      const video = videoEl.current;
      if (!onVideoResize || !video) return;

      const handleResize = () => {
        if (!video) return;
        const width = video?.videoWidth;
        const height = video?.videoHeight;
        if (width && height) {
          // Return the video's aspect ratio to the parent's handler
          onVideoResize(width / height);
        }
      };

      handleResize();
      video?.addEventListener('resize', handleResize);

      return () => video?.removeEventListener('resize', handleResize);
    }, [onVideoResize, videoEl, participant]);

    useEffect(() => {
      if (aspectRatio === tileAspectRatio) return;
      setTileAspectRatio(aspectRatio);
    }, [aspectRatio, tileAspectRatio]);

    /**
     * When video track changes, set screen share resize & update mirroring
     */
    useEffect(() => {
      const video = videoEl.current;

      if (!video || !videoState.track) return;

      /**
       * Update video aspect ratio if remote screen share window gets resized
       */
      let timeout;
      const handleAspectRatioResize = () => {
        if (!video) return;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (document.hidden) return;
          const settings = videoState?.track?.getSettings();
          const trackRatio = settings?.width / settings?.height;
          if (trackRatio) {
            setTileAspectRatio(trackRatio);
            return;
          }
          if (!video) return;
          const { videoHeight, videoWidth } = video;
          if (videoWidth && videoHeight) {
            const aspectRatio = videoWidth / videoHeight;
            setTileAspectRatio(aspectRatio);
          }
        }, 33);
      };

      if (isScreen) {
        handleAspectRatioResize();
        video.addEventListener('resize', handleAspectRatioResize);
      }
      return () => {
        if (isScreen) {
          video?.removeEventListener('resize', handleAspectRatioResize);
        }
      };
    }, [isScreen, videoState.track]);

    /**
     * Set up resize observer to update tile width
     */
    useEffect(() => {
      const tile = tileRef.current;
      if (!tile || typeof ResizeObserver === 'undefined') return false;
      let frame;
      const resizeObserver = new ResizeObserver(() => {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          if (!tile) return;
          const dimensions = tile?.getBoundingClientRect();
          const { width } = dimensions;
          setTileWidth(width);
        });
      });
      resizeObserver.observe(tile);
      return () => {
        if (frame) cancelAnimationFrame(frame);
        resizeObserver.disconnect();
      };
    }, [tileRef]);

    const isActiveTile = useMemo(() => {
      if (activeParticipant?.user_id === localParticipant?.user_id) return;

      return activeParticipant?.user_id === sessionId;
    }, [activeParticipant?.user_id, localParticipant?.user_id, sessionId]);

    const cx = classNames('tile', videoFit, {
      mirrored,
      avatar: showAvatar && videoState.isOff,
      screenShare: isScreen,
      active: showActiveSpeaker && isActiveTile,
      small: tileWidth < SM_TILE_MAX_WIDTH,
    });

    return (
      <div ref={tileRef} className={cx} {...props}>
        <div className="content">
          {showName && (
            <div className="name">
              {!participant?.audio && !isScreen && <IconMicMute />}
              {participant?.user_name}
            </div>
          )}

          {!videoState?.isOff ? (
            <Video
              ref={videoEl}
              fit={videoFit}
              isScreen={isScreen}
              sessionId={sessionId}
            />
          ) : (
            showAvatar && (
              <div className="avatar">
                <Avatar style={{ width: '35%', height: '35%' }} />
              </div>
            )
          )}
        </div>
        <style jsx>{`
          .tile .content {
            padding-bottom: ${100 / aspectRatio}%;
          }
        `}</style>
        <style jsx>{`
          .tile {
            background: var(--blue-dark);
            min-width: 1px;
            overflow: hidden;
            position: relative;
            width: 100%;
            box-sizing: border-box;
          }

          .tile.active:before {
            content: '';
            position: absolute;
            top: 0px;
            right: 0px;
            left: 0px;
            bottom: 0px;
            border: 2px solid var(--primary-default);
            box-sizing: border-box;
            pointer-events: none;
            z-index: 2;
          }

          .tile .name {
            position: absolute;
            bottom: 0px;
            display: flex;
            align-items: center;
            left: 0px;
            z-index: 2;
            line-height: 1;
            font-size: 0.875rem;
            color: white;
            font-weight: var(--weight-medium);
            padding: var(--spacing-xxs);
            text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.45);
            gap: var(--spacing-xxs);
          }

          .tile .name :global(svg) {
            color: var(--red-default);
          }

          .tile.small .name {
            font-size: 12px;
          }

          .tile :global(video) {
            height: calc(100% + 4px);
            left: -2px;
            object-position: center;
            position: absolute;
            top: -2px;
            width: calc(100% + 4px);
            z-index: 1;
          }

          .tile.contain :global(video) {
            object-fit: contain;
          }

          .tile.cover :global(video) {
            object-fit: cover;
          }

          .tile.mirrored :global(video) {
            transform: scale(-1, 1);
          }

          .tile .avatar {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </div>
    );
  }
);

Tile.propTypes = {
  sessionId: PropTypes.string.isRequired,
  mirrored: PropTypes.bool,
  showName: PropTypes.bool,
  showAvatar: PropTypes.bool,
  aspectRatio: PropTypes.number,
  onVideoResize: PropTypes.func,
  showActiveSpeaker: PropTypes.bool,
  videoFit: PropTypes.string,
};

export default Tile;
