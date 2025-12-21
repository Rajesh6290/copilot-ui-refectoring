"use client";
import { memo, useCallback, useEffect } from "react";

interface TabBarProps {
  tabs: string[];
  defaultTab?: string;
  onChange?: (tabName: string) => void;
  instanceId: string;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabBar = ({
  tabs,
  defaultTab,
  onChange,
  instanceId,
  className = "",
  activeClassName = "border-b-2 border-[#693EE0] text-gray-950 dark:text-white",
  inactiveClassName = "border-b-2 border-transparent text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white",
  activeTab,
  setActiveTab
}: TabBarProps) => {
  // Get tab value from URL
  const getTabFromUrl = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const params = new URLSearchParams(window.location.search);
    return params.get(instanceId);
  }, [instanceId]);

  // Update URL with new tab value
  const updateUrl = useCallback(
    (newTab: string) => {
      const params = new URLSearchParams(window.location.search);
      params.set(instanceId, newTab.toLowerCase());

      // Update URL without reload
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    },
    [instanceId]
  );

  // Initialize from URL or default
  useEffect(() => {
    const urlTab = getTabFromUrl();
    if (urlTab) {
      const matchingTab = tabs.find(
        (tab) => tab.toLowerCase() === urlTab.toLowerCase()
      );
      if (matchingTab && matchingTab !== activeTab) {
        setActiveTab(matchingTab);
        onChange?.(matchingTab);
      }
    } else if (!activeTab) {
      const initialTab = defaultTab || tabs[0];
      setActiveTab(initialTab || "");
      updateUrl(initialTab || "");
    }
  }, [
    tabs,
    defaultTab,
    activeTab,
    setActiveTab,
    onChange,
    getTabFromUrl,
    updateUrl
  ]);

  // Handle tab changes
  const handleTabChange = useCallback(
    (tabName: string) => {
      setActiveTab(tabName);
      updateUrl(tabName);
      onChange?.(tabName);
    },
    [onChange, updateUrl, setActiveTab]
  );

  // Listen for URL changes (browser back/forward)
  useEffect(() => {
    const handleUrlChange = () => {
      const urlTab = getTabFromUrl();
      if (urlTab) {
        const matchingTab = tabs.find(
          (tab) => tab.toLowerCase() === urlTab.toLowerCase()
        );
        if (matchingTab && matchingTab !== activeTab) {
          setActiveTab(matchingTab);
          onChange?.(matchingTab);
        }
      }
    };

    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, [tabs, activeTab, onChange, getTabFromUrl, setActiveTab]);

  return (
    <div
      className={`flex space-x-4 p-2 ${className} max-w-full overflow-x-auto`}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabChange(tab)}
          className={`text-nowrap px-4 py-2 font-[family-name:var(--font-geist-mono)] text-sm font-medium capitalize transition-colors ${
            tab === activeTab ? activeClassName : inactiveClassName
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default memo(TabBar);
