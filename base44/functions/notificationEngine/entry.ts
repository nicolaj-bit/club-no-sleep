import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { runNotificationEngine } from '../../shared/notificationEngine.js';

// Kanonisk indgang til den fælles notifikationsmotor.
// Body: { mode?: 'dry'|'test'|'live', testEmail?: string, cap?: number }
// Standard (ingen body / workflow-kald) = 'dry' (ingen afsendelse).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    return await runNotificationEngine(base44, { mode: body.mode, testEmail: body.testEmail, cap: body.cap });
  } catch (error) {
    console.error('[notificationEngine] Fejl:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});