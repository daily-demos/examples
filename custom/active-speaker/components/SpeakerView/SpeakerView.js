import React, { useEffect, useMemo, useRef } from 'react';
import { Container } from '@custom/basic-call/components/Call/Container';
import Header from '@custom/basic-call/components/Call/Header';
import ParticipantBar from '@custom/shared/components/ParticipantBar/ParticipantBar';
import VideoContainer from '@custom/shared/components/VideoContainer/VideoContainer';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useTracks } from '@custom/shared/contexts/TracksProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { isScreenId } from '@custom/shared/contexts/participantsState';
import { SpeakerTile } from './SpeakerTile';

const SIDEBAR_WIDTH = 186;

export const SpeakerView = () => {
  const { currentSpeaker, localParticipant, participants, screens } =
    useParticipants();
  const { updateCamSubscriptions } = useTracks();
  const { showLocalVideo } = useCallState();
  const { pinnedId } = useUIState();
  const activeRef = useRef();

  const screensAndPinned = useMemo(
    () => [...screens, ...participants.filter(({ id }) => id === pinnedId)],
    [participants, pinnedId, screens]
  );

  const otherParticipants = useMemo(
    () => participants.filter(({ isLocal }) => !isLocal),
    [participants]
  );

  const showSidebar = useMemo(() => {
    const hasScreenshares = screens.length > 0;

    if (isScreenId(pinnedId)) {
      return false;
    }

    return participants.length > 1 || hasScreenshares;
  }, [participants, pinnedId, screens]);

  /* const screenShareTiles = useMemo(
    () => <ScreensAndPins items={screensAndPinned} />,
    [screensAndPinned]
  ); */

  const hasScreenshares = useMemo(() => screens.length > 0, [screens]);

  const fixedItems = useMemo(() => {
    const items = [];
    if (showLocalVideo) {
      items.push(localParticipant);
    }
    if (hasScreenshares && otherParticipants.length > 0) {
      items.push(otherParticipants[0]);
    }
    return items;
  }, [hasScreenshares, localParticipant, otherParticipants, showLocalVideo]);

  const otherItems = useMemo(() => {
    if (otherParticipants.length > 1) {
      return otherParticipants.slice(hasScreenshares ? 1 : 0);
    }
    return [];
  }, [hasScreenshares, otherParticipants]);

  /**
   * Update cam subscriptions, in case ParticipantBar is not shown.
   */
  useEffect(() => {
    // Sidebar takes care of cam subscriptions for all displayed participants.
    if (showSidebar) return;
    updateCamSubscriptions([
      currentSpeaker?.id,
      ...screensAndPinned.map((p) => p.id),
    ]);
  }, [currentSpeaker, screensAndPinned, showSidebar, updateCamSubscriptions]);

  return (
    <div className="speaker-view">
      <Container>
        <Header />
        <VideoContainer>
          <div ref={activeRef} className="active">
            <SpeakerTile participant={currentSpeaker} screenRef={activeRef} />
          </div>
        </VideoContainer>
      </Container>
      {showSidebar && (
        <ParticipantBar
          fixed={fixedItems}
          others={otherItems}
          width={SIDEBAR_WIDTH}
        />
      )}

      <style jsx>{`
        .speaker-view {
          display: flex;
          height: 100%;
          width: 100%;
          position: relative;
        }

        .active {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default SpeakerView;
