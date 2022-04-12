import React from 'react';
import { CallProvider } from '@custom/shared/contexts/CallProvider';
import { MediaDeviceProvider } from '@custom/shared/contexts/MediaDeviceProvider';
import { ParticipantsProvider } from '@custom/shared/contexts/ParticipantsProvider';
import { ScreenShareProvider } from '@custom/shared/contexts/ScreenShareProvider';
import { TracksProvider } from '@custom/shared/contexts/TracksProvider';
import { UIStateProvider } from '@custom/shared/contexts/UIStateProvider';
import { WaitingRoomProvider } from '@custom/shared/contexts/WaitingRoomProvider';
import getDemoProps from '@custom/shared/lib/demoProps';
import { useRouter } from 'next/router';
import App from '../components/App';
import NotConfigured from '../components/Prejoin/NotConfigured';

const Room = ({
  domain,
  isConfigured = false,
  subscribeToTracksAutomatically = true,
  asides,
  modals,
  customTrayComponent,
  customAppComponent,
}) => {
  const router = useRouter();
  const { room, t } = router.query;

  if (!isConfigured) return <NotConfigured />;
  return (
    <UIStateProvider
      asides={asides}
      modals={modals}
      customTrayComponent={customTrayComponent}
    >
      <CallProvider
        domain={domain}
        room={room}
        token={t}
        subscribeToTracksAutomatically={subscribeToTracksAutomatically}
        cleanURLOnJoin
      >
        <ParticipantsProvider>
          <TracksProvider>
            <MediaDeviceProvider>
              <WaitingRoomProvider>
                <ScreenShareProvider>
                  {customAppComponent || <App />}
                </ScreenShareProvider>
              </WaitingRoomProvider>
            </MediaDeviceProvider>
          </TracksProvider>
        </ParticipantsProvider>
      </CallProvider>
    </UIStateProvider>
  )
};

export default Room;

export async function getStaticProps() {
  const defaultProps = getDemoProps();
  return {
    props: defaultProps,
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  }
}