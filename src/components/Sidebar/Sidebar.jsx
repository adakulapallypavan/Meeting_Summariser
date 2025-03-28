import React from 'react';
import TipsSection from './TipsSection';
import ProcessingSection from './ProcessingSection';

function Sidebar() {
  return (
    <div className="h-full overflow-y-auto sticky top-0">
      <div className="p-4 space-y-6">
        <TipsSection />
        <ProcessingSection />
      </div>
    </div>
  );
}

export default Sidebar;