import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { notifyCalendarPartnerChange } from '../../shared/notificationEngine.js';

// Kaldes fra kalenderen (frontend) efter create/update/delete af en aftale.
// Sender en notifikation til partneren (det andet familiemedlem) — aldrig til
// aktøren selv. Body: { action: 'created'|'updated'|'deleted', event, oldStartDatetime }
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    return await notifyCalendarPartnerChange(base44, body);
  } catch (error) {
    console.error('[notifyCalendarPartnerChange] Fejl:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}