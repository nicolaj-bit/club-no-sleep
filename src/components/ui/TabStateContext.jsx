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
  // scrollPositions: { [tabKey]: number }
  const scrollPositions = useRef({});
  // genericState: { [tabKey]: any } — for active tab indices etc.
  const genericState = useRef({});

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

  return (
    <TabStateContext.Provider value={{ saveScroll, restoreScroll, saveState, getState }}>
      {children}
    </TabStateContext.Provider>
  );
}

export function useTabState() {
  return useContext(TabStateContext);
}