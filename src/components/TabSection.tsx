
import React, { useState } from 'react';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TabSectionProps {
  tabs: {
    id: string;
    label: string;
    icon: ReactNode;
    content: ReactNode;
  }[];
}

const TabSection: React.FC<TabSectionProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="w-full">
      <div className="flex overflow-x-auto space-x-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-2">
        {tabs.map((tab) => (
          activeTab === tab.id && (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {tab.content}
            </motion.div>
          )
        ))}
      </div>
    </div>
  );
};

export default TabSection;
