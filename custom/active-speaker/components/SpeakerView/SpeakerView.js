import React, { useEffect, useMemo, useRef } from 'react';
import { Container } from '@custom/basic-call/components/Call/Container';
import Header from '@custom/basic-call/components/Call/Header';
import ParticipantBar from '@custom/shared/components/ParticipantBar/ParticipantBar';
import VideoContainer from '@custom/shared/components/VideoContainer/VideoContainer';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useTracks } from '@custom/shared/contexts/TracksProvider';
import { Screens } from './Screens';
import { SpeakerTile } from './SpeakerTile';

const SIDEBAR_WIDTH = 186;

export const SpeakerView = () => {
  const { currentSpeakerId, localParticipant, screens, orderedParticipantIds } =
    useParticipants();
  const { updateCamSubscriptions } = useTracks();
  const activeRef = useRef();

  const hasScreenshares = useMemo(() => screens.length > 0, [screens]);

  const showSidebar = useMemo(
    () => orderedParticipantIds.length > 0 || hasScreenshares,
    [hasScreenshares, orderedParticipantIds]
  );

  const fixedItems = useMemo(() => {
    const items = [];
    items.push(localParticipant?.session_id);
    if (hasScreenshares && orderedParticipantIds.length > 0) {
      items.push(orderedParticipantIds[0]);
    }
    return items;
  }, [hasScreenshares, localParticipant, orderedParticipantIds]);

  const otherItems = useMemo(() => {
    if (orderedParticipantIds.length > 1) {
      return orderedParticipantIds.slice(hasScreenshares ? 1 : 0);
    }
    return [];
  }, [hasScreenshares, orderedParticipantIds]);

  /**
   * Update cam subscriptions, in case ParticipantBar is not shown.
   */
  useEffect(() => {
    // Sidebar takes care of cam subscriptions for all displayed participants.
    if (showSidebar) return;
    updateCamSubscriptions([
      currentSpeakerId,
      ...screens.map((s) => s.session_id),
    ]);
  }, [currentSpeakerId, screens, showSidebar, updateCamSubscriptions]);

  return (
    <div className="speaker-view">
      <Container>
        <Header />
        <VideoContainer>
          <div ref={activeRef} className="active">
            {screens.length > 0 ? (
              <Screens />
            ) : (
              <SpeakerTile screenRef={activeRef} sessionId={currentSpeakerId} />
            )}
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