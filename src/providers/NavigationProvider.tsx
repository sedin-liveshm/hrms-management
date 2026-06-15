"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { NavigationContextValue } from "@/types/navigation";
import {
  navigationConfig,
  getDefaultGroupId,
} from "@/config/navigation";

const NavigationContext = createContext<NavigationContextValue | null>(null);

interface NavigationProviderProps {
  children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [activeGroupId, setActiveGroupIdState] = useState<string>(
    getDefaultGroupId(navigationConfig)
  );
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const setActiveGroupId = useCallback((id: string) => {
    setActiveGroupIdState(id);
    setIsPanelCollapsed(false);
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelCollapsed((prev) => !prev);
  }, []);

  const setMobileOpen = useCallback((open: boolean) => {
    setIsMobileOpen(open);
  }, []);

  const value: NavigationContextValue = {
    activeGroupId,
    isPanelCollapsed,
    isMobileOpen,
    setActiveGroupId,
    togglePanel,
    setMobileOpen,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}
export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (context === null) {
    throw new Error(
      "useNavigation must be used within a NavigationProvider. " +
      "Wrap your layout with <NavigationProvider>."
    );
  }
  return context;
}
