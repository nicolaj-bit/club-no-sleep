/**
 * TabStateContext — preserves per-tab scroll positions and UI state
 * across tab switches, emulating native iOS tab bar behaviour.
 *
 * Usage in a page:
 *   const { saveScroll, restoreScroll } = useTabState('Shop');
 *   <div ref={containerRef} onScroll={e => saveScroll(e.target.scrollTop)} />
 *
 * On mount: restoreScroll(ref.current)
 */
import React, { createContext, useContext, useRef } from 'react';

const TabStateContext = createContext({});

export function TabStateProvider({ children }) {
  const scrollPositions = useRef({});
  const genericState = useRef({});
  // Stores the last visited full path per tab page key
  const tabLastPath = useRef({});

  const saveScroll = (tabKey, position) => {
    scrollPositions.current[tabKey] = position;
  };

  const restoreScroll = (tabKey, element) => {
    if (!element) return;
    const saved = scrollPositions.current[tabKey];
    if (saved !== undefined) {
      element.scrollTop = saved;
    }
  };

  const saveState = (tabKey, state) => {
    genericState.current[tabKey] = state;
  };

  const getState = (tabKey) => genericState.current[tabKey];

  const saveTabPath = (pageKey, path) => {
    tabLastPath.current[pageKey] = path;
  };

  const getTabPath = (pageKey) => tabLastPath.current[pageKey] || null;

  const clearTabPath = (pageKey) => {
    delete tabLastPath.current[pageKey];
  };

  return (
    <TabStateContext.Provider value={{ saveScroll, restoreScroll, saveState, getState, saveTabPath, getTabPath, clearTabPath }}>
      {children}
    </TabStateContext.Provider>
  );
}

export function useTabState() {
  return useContext(TabStateContext);
}