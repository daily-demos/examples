import React, { useRef } from 'react';
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
    aspectRatio = DEFAULT_ASPECT_RATIO,
    ...props
  }) => {
    const videoTrack = useVideoTrack(participant);
    const videoEl = useRef(null);

    const cx = classNames('tile', {
      mirrored,
      avatar: showAvatar && !videoTrack,
      active: participant.isActiveSpeaker,
    });

    return (
      <div className={cx} {...props}>
        <div className="content">
          {showName && (
            <div className="name">
              {participant.isMicMuted && <IconMicMute />}
              {participant.name}
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
            padding-bottom: ${100 / aspectRatio}%;
          }
          @supports (aspect-ratio: 1 / 1) {
            .tile .content {
              aspect-ratio: ${aspectRatio};
              padding-bottom: 0;
            }
          }
        `}</style>
        <style jsx>{`
          .tile {
            background: var(--blue-dark);
            min-width: 1px;
            position: relative;
            width: 100%;
            box-sizing: border-box;
          }

          .tile.active {
            border: 2px solid var(--primary-default);
          }

          .tile.mirrored :global(video) {
            transform: scale(-1, 1);
          }

          .tile .name {
            position: absolute;
            bottom: 0px;
            display: flex;
            align-items: center;
            left: 0px;
            z-index: 2;
            line-height: 1;
            color: white;
            font-weight: var(--weight-medium);
            padding: var(--spacing-xxs);
            text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.35);
            gap: var(--spacing-xxs);
          }

          .tile .name :global(svg) {
            color: var(--red-default);
          }

          .tile :global(video) {
            object-position: center;
            object-fit: cover;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
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
};

export default Tile;
