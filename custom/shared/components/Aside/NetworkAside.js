import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { Aside } from '@custom/shared/components/Aside';
import { useCallState } from '../../contexts/CallProvider';
import { useUIState } from '../../contexts/UIStateProvider';
import Capsule from '../Capsule';

export const NETWORK_ASIDE = 'network';

const NETWORK_QUALITY_LABELS = {
  low: 'Low',
  'very-low': 'Very Low',
  good: 'Good',
};

export const NetworkAside = () => {
  const { callObject } = useCallState();
  const { showAside, setShowAside } = useUIState();
  const [networkStats, setNetworkStats] = useState();

  const updateStats = useCallback(async () => {
    setNetworkStats(await callObject.getNetworkStats());
  }, [callObject]);

  useEffect(() => {
    if (!callObject) return;

    updateStats();

    const i = setInterval(updateStats, 2000);

    return () => clearInterval(i);
  }, [callObject, updateStats]);

  const downloadKbs = useMemo(
    () =>
      Math.round(
        (networkStats?.stats?.latest?.videoRecvBitsPerSecond ?? 0) / 1000
      ),
    [networkStats?.stats?.latest?.videoRecvBitsPerSecond]
  );

  const uploadKbs = useMemo(
    () =>
      Math.round(
        (networkStats?.stats?.latest?.videoSendBitsPerSecond ?? 0) / 1000
      ),
    [networkStats?.stats?.latest?.videoSendBitsPerSecond]
  );

  if (!showAside || showAside !== NETWORK_ASIDE) {
    return null;
  }

  return (
    <Aside onClose={() => setShowAside(false)}>
      <div className="network-aside">
        {networkStats ? (
          <>
            <div className="panel">
              <h4>Packet Loss:</h4>
              Your network quality is:
              <Capsule variant="success">
                {NETWORK_QUALITY_LABELS[networkStats.threshold]}
              </Capsule>
            </div>
            <div className="panel">
              <h4>Download rate:</h4>
              {downloadKbs} kbps
            </div>
            <div className="panel">
              <h4>Upload rate:</h4>
              {uploadKbs} kbps
            </div>
            <div className="note">
              Download and upload rates reflect bandwidth used by this call.
              Updated every 2 seconds.
            </div>
          </>
        ) : (
          <>Fetching network stats...</>
        )}
        <style jsx>{`
          .panel {
            background-color: var(--gray-wash);
            border-radius: var(--radius-sm);
            padding: var(--spacing-sm);
            margin: var(--spacing-xxs);
          }

          .panel h4 {
            margin: 0 0 var(--spacing-xxs) 0;
          }

          .note {
            margin: var(--spacing-xxs);
            color: var(--text-mid);
            font-size: 0.875rem;
          }
        `}</style>
      </div>
    </Aside>
  );
};

export default NetworkAside;
