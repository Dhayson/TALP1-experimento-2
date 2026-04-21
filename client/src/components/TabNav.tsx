import { useState, React } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabNavProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function TabNav({ tabs, defaultTab }: TabNavProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div>
      <div className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {activeContent}
      </div>
    </div>
  );
}