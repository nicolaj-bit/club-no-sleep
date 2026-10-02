import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { runNotificationEngine } from '../../shared/notificationEngine.js';

// Tynd wrapper ind i den fælles motor. Kaldes IKKE længere af workflows.
// Body understøttes: { mode, testEmail, cap }.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    return await runNotificationEngine(base44, { mode: body.mode, testEmail: body.testEmail, cap: body.cap });
  } catch (error) {
    console.error('[checkWonderWeeks] Fejl:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});