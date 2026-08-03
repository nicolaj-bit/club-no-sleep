import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { sleepLogData, existing_id } = body;

    // Tving user_email til den indloggede bruger — sikrer RLS-kompatibilitet
    const payload = {
      ...sleepLogData,
      user_email: user.email,
    };

    // Hvis child_id er sat, verificér at barnet tilhører den indloggede bruger
    if (payload.child_id) {
      const children = await base44.asServiceRole.entities.Child.filter({
        id: payload.child_id,
        user_email: user.email,
      });
      if (!children || children.length === 0) {
        return Response.json({ error: 'Child does not belong to user' }, { status: 403 });
      }
    }

    if (existing_id) {
      // Verificér at eksisterende log tilhører brugeren før opdatering
      const existingLogs = await base44.asServiceRole.entities.SleepLog.filter({
        id: existing_id,
        user_email: user.email,
      });
      if (!existingLogs || existingLogs.length === 0) {
        return Response.json({ error: 'Sleep log not found or does not belong to user' }, { status: 403 });
      }
      const updated = await base44.asServiceRole.entities.SleepLog.update(existing_id, payload);
      return Response.json({ ok: true, sleepLog: updated });
    }

    const created = await base44.asServiceRole.entities.SleepLog.create(payload);
    return Response.json({ ok: true, sleepLog: created });
  } catch (error) {
    console.error('createSleepLog error:', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}