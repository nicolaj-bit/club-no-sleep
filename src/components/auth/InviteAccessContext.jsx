import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const InviteAccessContext = createContext({
  isInvited: false,
  permissions: null,
  inviterEmail: null,
  inviterProfile: null,
  inviterChildren: [],
  inviterSleepLogs: [],
  inviterCalendarEvents: [],
  loading: true,
  refresh: async () => {},
});

export function InviteAccessProvider({ children }) {
  const [state, setState] = useState({
    isInvited: false,
    permissions: null,
    inviterEmail: null,
    inviterProfile: null,
    inviterChildren: [],
    inviterSleepLogs: [],
    inviterCalendarEvents: [],
    loading: true,
  });

  const loadData = useCallback(async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        setState(s => ({ ...s, loading: false }));
        return;
      }
      const result = await base44.functions.invoke('getSharedFamilyData', {});
      const data = result?.data || result;
      if (data?.is_invited) {
        setState({
          isInvited: true,
          permissions: data.permissions,
          inviterEmail: data.inviter_email,
          inviterProfile: data.inviter_profile,
          inviterChildren: data.inviter_children || [],
          inviterSleepLogs: data.inviter_sleep_logs || [],
          inviterCalendarEvents: data.inviter_calendar_events || [],
          loading: false,
        });
      } else {
        setState(s => ({ ...s, isInvited: false, loading: false }));
      }
    } catch {
      setState(s => ({ ...s, isInvited: false, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <InviteAccessContext.Provider value={{ ...state, refresh: loadData }}>
      {children}
    </InviteAccessContext.Provider>
  );
}

export function useInviteAccess() {
  return useContext(InviteAccessContext);
}