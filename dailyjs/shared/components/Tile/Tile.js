import React, { useState, useEffect, useRef } from 'react';
import useVideoTrack from '@dailyjs/shared/hooks/useVideoTrack';
import { ReactComponent as IconMicMute } from '@dailyjs/shared/icons/mic-off-sm.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { DEFAULT_ASPECT_RATIO } from '../../constants';
import { Video } from './Video';
import { ReactComponent as Avatar } from './avatar.svg';

export const Tile = React.memo(
  ({
    participant,
    mirrored = true,
    showName = true,
    showAvatar = true,
    showActiveSpeaker = true,
    aspectRatio = DEFAULT_ASPECT_RATIO,
    onVideoResize,
    videoFit = 'contain',
    ...props
  }) => {
    const videoTrack = useVideoTrack(participant);
    const videoEl = useRef(null);
    const [tileAspectRatio, setTileAspectRatio] = useState(aspectRatio);

    const [layer, setLayer] = useState();

    /**
     * Add optional event listener for resize event so the parent component
     * can know the video's native aspect ratio.
     */
    useEffect(() => {
      const video = videoEl.current;
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
    }, [onVideoResize, videoEl, participant]);

    useEffect(() => {
      if (aspectRatio === tileAspectRatio) return;
      setTileAspectRatio(aspectRatio);
    }, [aspectRatio, tileAspectRatio]);

    useEffect(() => {
      if (
        typeof rtcpeers === 'undefined' ||
        rtcpeers?.getCurrentType() !== 'sfu'
      )
        return false;

      const i = setInterval(() => {
        setLayer(
          rtcpeers.sfu.consumers[`${participant.id}/cam-video`]?._preferredLayer
        );
      }, 1500);

      return () => clearInterval(i);
    }, [participant]);

    const cx = classNames('tile', videoFit, {
      mirrored,
      avatar: showAvatar && !videoTrack,
      active: showActiveSpeaker && participant.isActiveSpeaker,
    });

    return (
      <div className={cx} {...props}>
        <div className="content">
          {showName && (
            <div className="name">
              {participant.isMicMuted && <IconMicMute />}
              {participant.name} - {layer}
            </div>
          )}
          {videoTrack ? (
            <Video ref={videoEl} videoTrack={videoTrack} />
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
            padding-bottom: ${100 / tileAspectRatio}%;
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
  participant: PropTypes.object.isRequired,
  mirrored: PropTypes.bool,
  showName: PropTypes.bool,
  showAvatar: PropTypes.bool,
  aspectRatio: PropTypes.number,
  onVideoResize: PropTypes.func,
  videoFit: PropTypes.string,
  showActiveSpeaker: PropTypes.bool,
};

export default Tile;
