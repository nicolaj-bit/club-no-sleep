import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { backfillNotificationLog } from '../../shared/notificationEngine.js';

// Engangsudfyldning: overfører Child.last_notified_leap og
// UserProfile.last_notified_pregnancy_week til NotificationLog, så eksisterende
// brugere ikke får tidligere tigerspring/graviditetsuger igen ved overgangen.
// Idempotent — kan køres flere gange.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    return await backfillNotificationLog(base44);
  } catch (error) {
    console.error('[backfillNotificationLog] Fejl:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});