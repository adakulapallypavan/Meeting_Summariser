import React from 'react';
import TipsSection from './TipsSection';
import ProcessingSection from './ProcessingSection';

function Sidebar() {
  return (
    <div className="h-full overflow-y-auto sticky top-0">
      <div className="p-6 space-y-6">
        {/* Added proper centering padding */}
        <div className="mx-auto px-3">
          <TipsSection />
        </div>
        <ProcessingSection />
      </div>
    </div>
  );
}

export default Sidebar;