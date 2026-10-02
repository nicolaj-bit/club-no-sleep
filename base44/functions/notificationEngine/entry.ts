import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { runNotificationEngine } from '../../shared/notificationEngine.js';

// Kanonisk indgang til den fælles notifikationsmotor.
// De fire gamle funktioner (checkWonderWeeks, pregnancyWeeklyNotification,
// calendarEngine, checkMilestoneNotifications) kalder samme motor og kan
// med fordel erstattes af dette ene kald i workflows.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    return await runNotificationEngine(base44);
  } catch (error) {
    console.error('[notificationEngine] Fejl:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});