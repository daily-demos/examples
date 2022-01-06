import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState, VIEW_MODE_GRID, VIEW_MODE_SPEAKER } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconGridView } from '@custom/shared/icons/grid-md.svg';
import { ReactComponent as IconSpeakerView } from '@custom/shared/icons/speaker-view-md.svg';

export const ViewTray = () => {
  const { participants } = useParticipants();
  const { viewMode, setPreferredViewMode } = useUIState();

  const onClick = () =>
    setPreferredViewMode(viewMode === VIEW_MODE_SPEAKER ? VIEW_MODE_GRID: VIEW_MODE_SPEAKER);

  return (
    <TrayButton
      label={viewMode === VIEW_MODE_GRID ? 'Speaker': 'Grid'}
      disabled={participants.length < 2}
      onClick={onClick}
    >
      {viewMode === VIEW_MODE_SPEAKER ? <IconGridView />: <IconSpeakerView />}
    </TrayButton>
  );
};

export default ViewTray;