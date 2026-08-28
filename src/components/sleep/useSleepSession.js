import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useInviteAccess } from '@/components/auth/InviteAccessContext';
import { toast } from 'sonner';

// Hook der styrer live søvnsession-data og handlinger.
// Henter både aktiv session og historik via getSleepLogs (asServiceRole).
// Optimistisk cache-opdatering ved alle handlinger så UI reagerer med det samme.
export function useSleepSession(user) {
  const queryClient = useQueryClient();
  const { isInvited, refresh: refreshInviteData } = useInviteAccess();
  const queryKey = ['sleeplogs', user?.email];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await base44.functions.invoke('getSleepLogs', {});
      return res?.data || res;
    },
    enabled: !!user,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ action, session_id, child_id, sleep_type }) => {
      const res = await base44.functions.invoke('manageSleepSession', { action, session_id, child_id, sleep_type });
      return res?.data || res;
    },
    onSuccess: (result) => {
      const session = result?.session;
      if (!session) return;
      // Optimistisk opdatering — UI opdateres med det samme
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        const logs = (old.sleep_logs || []).filter(l => l.id !== session.id);
        const newLogs = [session, ...logs];
        const isActive = session.session_status === 'active_sleep' || session.session_status === 'active_awake';
        return {
          ...old,
          sleep_logs: newLogs,
          active_session: isActive ? session : null,
        };
      });
      // Baggrundssync for at sikre konsistens
      queryClient.invalidateQueries(queryKey);
      if (isInvited) refreshInviteData();
    },
    onError: (error) => {
      const msg = error?.message || 'Noget gik galt';
      toast.error(msg);
    },
  });

  const refresh = async () => {
    await queryClient.invalidateQueries(queryKey);
    if (isInvited) await refreshInviteData();
  };

  const activeSession = data?.active_session || null;
  const allLogs = data?.sleep_logs || [];
  const history = activeSession ? allLogs.filter(l => l.id !== activeSession.id) : allLogs;

  return {
    activeSession,
    history,
    loading: isLoading,
    startSession: (child_id, sleep_type) => actionMutation.mutateAsync({ action: 'start', child_id, sleep_type }),
    markAwake: (session_id) => actionMutation.mutateAsync({ action: 'mark_awake', session_id }),
    markSleeping: (session_id) => actionMutation.mutateAsync({ action: 'mark_sleeping', session_id }),
    endSession: (session_id) => actionMutation.mutateAsync({ action: 'end', session_id }),
    undoEnd: (session_id) => actionMutation.mutateAsync({ action: 'undo_end', session_id }),
    refresh,
    isPending: actionMutation.isPending,
  };
}