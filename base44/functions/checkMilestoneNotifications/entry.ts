import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { runNotificationEngine } from '../../shared/notificationEngine.js';

// Tynd wrapper — al logik ligger nu i den fælles motor (notificationEngine).
// Beholdt så eksisterende workflows stadig virker.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    return await runNotificationEngine(base44);
  } catch (error) {
    console.error('[checkMilestoneNotifications] Fejl:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});