import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const ActiveChildContext = createContext({
  children: [],
  activeChild: null,
  setActiveChildId: () => {},
  loading: true,
  refetch: () => {},
});

export function ActiveChildProvider({ children: reactChildren }) {
  const [children, setChildren] = useState([]);
  const [activeChildId, setActiveChildIdState] = useState(() =>
    localStorage.getItem('active-child-id') || null
  );
  const [loading, setLoading] = useState(true);

  const fetchChildren = useCallback(async () => {
    try {
      // Brug cachet user-email hvis muligt for at undgå ekstra auth-kald
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { setLoading(false); return; }
      const user = await base44.auth.me();
      if (!user) { setLoading(false); return; }

      const list = await base44.entities.Child.filter({ user_email: user.email }, 'order', 20);
      setChildren(list);

      if (list.length > 0) {
        const stored = localStorage.getItem('active-child-id');
        const exists = list.some(c => c.id === stored);
        if (!exists) {
          setActiveChildIdState(list[0].id);
          localStorage.setItem('active-child-id', list[0].id);
        }
      }
    } catch (e) {
      console.log('Could not load children:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const setActiveChildId = (id) => {
    setActiveChildIdState(id);
    localStorage.setItem('active-child-id', id);
  };

  const activeChild = children.find(c => c.id === activeChildId) || children[0] || null;

  return (
    <ActiveChildContext.Provider value={{ children, activeChild, setActiveChildId, loading, refetch: fetchChildren }}>
      {reactChildren}
    </ActiveChildContext.Provider>
  );
}

export function useActiveChild() {
  return useContext(ActiveChildContext);
}