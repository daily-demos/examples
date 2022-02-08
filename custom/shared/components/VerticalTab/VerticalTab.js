import React from 'react';
import Button from '../Button';

export const VerticalTab = ({ tabs, activeTab, setActiveTab, children }) => {
  return (
    <div className="vertical-tabs">
      <div className="tabs">
        {tabs.map(tab =>
          <Button
            key={tab.name}
            variant={activeTab === tab.name ? 'primary': 'transparent'}
            onClick={() => setActiveTab(tab.name)}
            size="extra-small"
          >
            {tab.label}
          </Button>
        )}
      </div>
      <div className="active-tab">
        {children}
      </div>
      <style jsx>{`
        .vertical-tabs {
          display: flex;
          width: 100%;
        }
        .active-tab {
          display: initial;
          width: 100%;
          padding: 0 var(--spacing-md);
        }
      `}</style>
    </div>
  )
};

export default VerticalTab;