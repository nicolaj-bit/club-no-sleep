import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Rate limiting: max 5 reports per user per hour (in-memory, resets on cold start)
const reportCounts = new Map();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limit
    const key = user.email;
    const now = Date.now();
    const entry = reportCounts.get(key) || { count: 0, resetAt: now + 3600000 };
    if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + 3600000; }
    if (entry.count >= 5) {
      return Response.json({ error: 'For mange indberetninger. Prøv igen om en time.' }, { status: 429 });
    }
    entry.count++;
    reportCounts.set(key, entry);

    const body = await req.json();
    const { reported_email, type, message_id, reason } = body;

    if (!reported_email || !type || !reason) {
      return Response.json({ error: 'Manglende felter' }, { status: 400 });
    }
    if (!['user', 'message'].includes(type)) {
      return Response.json({ error: 'Ugyldig type' }, { status: 400 });
    }
    if (reported_email === user.email) {
      return Response.json({ error: 'Du kan ikke indberette dig selv' }, { status: 400 });
    }

    await base44.entities.Report.create({
      reporter_email: user.email,
      reported_email,
      type,
      message_id: message_id || null,
      reason,
      status: 'pending',
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});