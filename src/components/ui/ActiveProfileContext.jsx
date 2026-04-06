import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const ActiveProfileContext = createContext({
  activeProfile: null,
  allProfiles: [],
  isMom: false,
  switchProfile: () => {},
  refreshProfiles: async () => {},
  loading: true,
});

export function ActiveProfileProvider({ children }) {
  const [allProfiles, setAllProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfiles = useCallback(async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { setLoading(false); return; }
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      setAllProfiles(profiles);

      // Hent gemt aktiv profil-id fra localStorage
      const savedId = localStorage.getItem('active_profile_id');
      const saved = profiles.find(p => p.id === savedId);
      const active = saved || profiles[0] || null;
      setActiveProfile(active);
      if (active) localStorage.setItem('active_profile_id', active.id);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  const switchProfile = useCallback((profile) => {
    setActiveProfile(profile);
    localStorage.setItem('active_profile_id', profile.id);
  }, []);

  const isMom = activeProfile?.profile_label === 'mor';

  return (
    <ActiveProfileContext.Provider value={{ activeProfile, allProfiles, isMom, switchProfile, refreshProfiles, loading }}>
      {children}
    </ActiveProfileContext.Provider>
  );
}

export function useActiveProfile() {
  return useContext(ActiveProfileContext);
}