import React, { memo, useEffect, useState, useRef, useMemo } from 'react';
import Video from '@custom/shared/components/Tile/Video';
import { ReactComponent as Avatar } from '@custom/shared/components/Tile/avatar.svg';
import { DEFAULT_ASPECT_RATIO } from '@custom/shared/constants.js';
import { useAudioLevel } from '@custom/shared/hooks/useAudioLevel';
import useAudioTrack from '@custom/shared/hooks/useAudioTrack';
import useVideoTrack from '@custom/shared/hooks/useVideoTrack';
import { ReactComponent as IconMicMute } from '@custom/shared/icons/mic-off-sm.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const SM_TILE_MAX_WIDTH = 300;

export const Tile = memo(
  ({
     participant,
     mirrored = true,
     showName = true,
     showAvatar = true,
     showActiveSpeaker = true,
     videoFit = 'contain',
     aspectRatio = DEFAULT_ASPECT_RATIO,
     onVideoResize,
     ...props
   }) => {
    const audioTrack = useAudioTrack(participant);
    const videoTrack = useVideoTrack(participant);
    const videoRef = useRef(null);
    const tileRef = useRef(null);
    const [tileWidth, setTileWidth] = useState(0);

    const audioStream = useMemo(() => {
      if (!process.browser || participant.isMicMuted) return null;
      if (audioTrack) return new MediaStream([audioTrack]);
      return null;
    }, [audioTrack, participant.isMicMuted]);

    const volume = useAudioLevel(audioStream);

    const dotHeights = useMemo(
      () => [5, 11, 7].map((b) => 3 + b * 2 * (volume >= 0.1 ? volume : 0)),
      [volume]
    );

    /**
     * Effect: Resize
     *
     * Add optional event listener for resize event so the parent component
     * can know the video's native aspect ratio.
     */
    useEffect(() => {
      const video = videoRef.current;
      if (!onVideoResize || !video) return false;

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
    }, [onVideoResize, videoRef, participant]);

    /**
     * Effect: Resize Observer
     *
     * Adjust size of text overlay based on tile size
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

    const cx = classNames('tile', videoFit, {
      mirrored,
      avatar: showAvatar && !videoTrack,
      screenShare: participant.isScreenShare,
      active: showActiveSpeaker && participant.isActiveSpeaker,
      small: tileWidth < SM_TILE_MAX_WIDTH,
    });

    return (
      <div ref={tileRef} className={cx} {...props}>
        <div className="content">
          {showName && (
            <div className="name">
              {!participant.isLocal && !participant.isMicMuted && (
                <div className="volume">
                  {dotHeights.map((height, i) => {
                    const key = `dot-${i}`;
                    return <span key={key} className="dot" style={{ height }} />;
                  })}
                </div>
              )}
              {participant.isMicMuted && !participant.isScreenShare && (
                <IconMicMute />
              )}
              {participant.name}
            </div>
          )}
          {videoTrack ? (
            <Video
              ref={videoRef}
              participantId={participant?.id}
              videoTrack={videoTrack}
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
          
          .volume {
            align-items: center;
            display: flex;
            height: 16px;
            justify-content: center;
            width: 16px;
          }
          .volume :global(.dot) {
            background: var(--primary-default);
            border-radius: 3px;
            margin: 0 1px;
            transition: height 0.15s ease;
            width: 3px;
          }
        `}</style>
      </div>
    );
  }
);

Tile.propTypes = {
  participant: PropTypes.object.isRequired,
  mirrored: PropTypes.bool,
  showName: PropTypes.bool,
  showAvatar: PropTypes.bool,
  aspectRatio: PropTypes.number,
  onVideoResize: PropTypes.func,
  showActiveSpeaker: PropTypes.bool,
  videoFit: PropTypes.string,
};

export default Tile;
