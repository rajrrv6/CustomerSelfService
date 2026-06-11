'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function useTabQueryState(defaultTab: string, validTabs: string[], propActiveTab?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Legacy alias route overrides should initialize the query-param state only once during mount.
    if (searchParams && !searchParams.has('tab') && propActiveTab && validTabs.includes(propActiveTab)) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', propActiveTab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, []);

  const validTabsStr = validTabs.join(',');
  useEffect(() => {
    if (!isMounted || !searchParams) return;
    const tabParam = searchParams.get('tab');
    if (tabParam && !validTabs.includes(tabParam)) {
      const params = new URLSearchParams(searchParams.toString());
      const fallbackTab = propActiveTab && validTabs.includes(propActiveTab) ? propActiveTab : defaultTab;
      params.set('tab', fallbackTab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [isMounted, searchParams, validTabsStr, defaultTab, propActiveTab, pathname, router]);

  const activeTabParam = isMounted && searchParams ? searchParams.get('tab') : null;

  // Prioritize URL query param if present and valid; next try propActiveTab; fallback to defaultTab
  const activeTab = activeTabParam && validTabs.includes(activeTabParam)
    ? activeTabParam
    : (propActiveTab && validTabs.includes(propActiveTab) ? propActiveTab : defaultTab);

  const setActiveTab = (newTab: string) => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return [activeTab, setActiveTab] as const;
}
