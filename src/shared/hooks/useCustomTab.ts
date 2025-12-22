import { useCurrentMenuItem } from "@/shared/utils";

interface TabItem {
  metadata?: {
    label?: string;
    reference?: string;
  };
  permission: {
    is_shown: boolean;
  };
}

const useCustomTab = (tab: string) => {
  const currentAccess = useCurrentMenuItem();
  const visibleTabs =
    currentAccess?.tabs?.filter((e: TabItem) => e?.permission?.is_shown) || [];
  const tabMapping: Record<string, string> =
    visibleTabs?.reduce(
      (acc: Record<string, string>, tabs: TabItem) => {
        const label = tabs.metadata?.label;
        const reference = tabs.metadata?.reference;
        if (label && reference) {
          acc[label] = reference;
        }
        return acc;
      },
      {} as Record<string, string>
    ) || {};

  const tabLabels = Object.keys(tabMapping);
  const activeReference = tabMapping[tab] || tabMapping[tabLabels[0] || ""];

  return {
    currentAccess,
    tabLabels,
    activeReference,
    visibleTabs
  };
};

export default useCustomTab;
