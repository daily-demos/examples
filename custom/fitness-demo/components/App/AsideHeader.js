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
          className={`header ${showAside === PEOPLE_ASIDE && 'active'}`}
          onClick={() => setShowAside(PEOPLE_ASIDE)}
        >
          People
        </div>
        <div
          className={`header ${showAside === CHAT_ASIDE && 'active'}`}
          onClick={() => setShowAside(CHAT_ASIDE)}
        >
          Chat
        </div>
      </div>
      <style jsx>{`
        .aside-header {
          display: flex;
          width: 100%;
          height: 5vh;
          text-align: center;
        }
        .aside-header .header {
          height: 100%;
          width: 50%;
          background: var(--gray-wash);
          color: var(--gray-dark);
          cursor: pointer;
        }
        
        .header.active {
          background: var(--reverse)!important;
          color: var(--text-default)!important;
          font-weight: 900;
        }
      `}</style>
    </>
  )
};

export default AsideHeader;