import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useInviteAccess } from '@/components/auth/InviteAccessContext';

const ActiveProfileContext = createContext({
  activeProfile: null,
  allProfiles: [],
  isMom: false,
  isInvited: false,
  permissions: null,
  switchProfile: () => {},
  refreshProfiles: async () => {},
  loading: true,
});

export function ActiveProfileProvider({ children }) {
  const { isInvited, permissions, inviterProfile, loading: inviteLoading } = useInviteAccess();
  const [allProfiles, setAllProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfiles = useCallback(async (userEmail) => {
    try {
      let email = userEmail;
      if (!email) {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) { setLoading(false); return; }
        const user = await base44.auth.me();
        email = user?.email;
      }
      if (!email) { setLoading(false); return; }

      const profiles = await base44.entities.UserProfile.filter({ user_email: email });
      if (!Array.isArray(profiles)) throw new Error('profiles not an array');
      setAllProfiles(profiles);

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

  // For invited users, override activeProfile with inviter's profile
  useEffect(() => {
    if (isInvited && inviterProfile) {
      setActiveProfile(inviterProfile);
    }
  }, [isInvited, inviterProfile]);

  const switchProfile = useCallback((profile) => {
    if (isInvited) return; // Invited users can't switch profiles
    setActiveProfile(profile);
    localStorage.setItem('active_profile_id', profile.id);
  }, [isInvited]);

  const isMom = activeProfile?.profile_label === 'mor';

  const combinedLoading = loading || (isInvited && inviteLoading);

  return (
    <ActiveProfileContext.Provider value={{ activeProfile, allProfiles, isMom, isInvited, permissions, switchProfile, refreshProfiles, loading: combinedLoading }}>
      {children}
    </ActiveProfileContext.Provider>
  );
}

export function useActiveProfile() {
  return useContext(ActiveProfileContext);
}