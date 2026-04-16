import React from "react";

export type TabListTab = {
  label: string;
  key: string;
  content: React.ReactNode;
};

export interface TabListProps {
  tabs: TabListTab[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function TabList({ tabs, activeTab, onTabChange }: TabListProps) {
  const [internalActiveTab, setInternalActiveTab] = React.useState(0);

  // Find the active tab index based on value
  const activeTabIndex = activeTab
    ? tabs.findIndex((tab) => tab.key === activeTab)
    : internalActiveTab;

  const handleTabClick = (index: number) => {
    if (onTabChange) {
      onTabChange(tabs[index].key);
    } else {
      setInternalActiveTab(index);
    }
  };

  return (
    <div className="window-body">
      <menu role="tablist">
        {tabs.map((tab, index) => (
          <li
            key={index}
            role="tab"
            aria-selected={activeTabIndex === index}
            onClick={() => handleTabClick(index)}
            style={{
              cursor: "pointer",
            }}
          >
            <a>{tab.label}</a>
          </li>
        ))}
      </menu>
      <div role="tabpanel" className="sunken-panel" style={{ height: "calc(100% - 40px)", overflowY: "auto" }}>
        {tabs[activeTabIndex]?.content}
      </div>
    </div>
  );
}
