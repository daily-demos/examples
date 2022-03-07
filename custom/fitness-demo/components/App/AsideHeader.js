import React from 'react';
import { PEOPLE_ASIDE } from '@custom/shared/components/Aside/PeopleAside';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { CHAT_ASIDE } from '../Call/ChatAside';

export const AsideHeader = () => {
  const { showAside, setShowAside } = useUIState();

  return (
    <>
      <div className="aside-header">
        <div
          className={`tab ${showAside === PEOPLE_ASIDE && 'active'}`}
          onClick={() => setShowAside(PEOPLE_ASIDE)}
        >
          <p>People</p>
        </div>
        <div
          className={`tab ${showAside === CHAT_ASIDE && 'active'}`}
          onClick={() => setShowAside(CHAT_ASIDE)}
        >
          <p>Chat</p>
        </div>
      </div>
      <style jsx>{`
        .aside-header {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 5vh;
          text-align: center;
          background: var(--gray-wash);
          color: var(--gray-dark);
        }
        
        .tab {
          height: 100%;
          width: 50%;
          cursor: pointer;
        }
        
        .tab.active {
          background: var(--reverse)!important;
          color: var(--text-default)!important;
          font-weight: 900;
        }
      `}</style>
    </>
  )
};

export default AsideHeader;