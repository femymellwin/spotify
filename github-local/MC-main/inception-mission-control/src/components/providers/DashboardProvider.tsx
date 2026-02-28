"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface DashboardContextValue {
  isOffline: boolean;
  globalRefreshKey: number;
  refreshAll: () => void;
}

const DashboardContext = createContext<DashboardContextValue>({
  isOffline: false,
  globalRefreshKey: 0,
  refreshAll: () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [globalRefreshKey, setGlobalRefreshKey] = useState(0);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const refreshAll = useCallback(() => {
    setGlobalRefreshKey((k) => k + 1);
  }, []);

  return (
    <DashboardContext.Provider value={{ isOffline, globalRefreshKey, refreshAll }}>
      {children}
    </DashboardContext.Provider>
  );
}
