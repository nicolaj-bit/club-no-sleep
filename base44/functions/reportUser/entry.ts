import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { getUserLanguage } from '../../shared/i18n.js';

// Fejlbeskeder vises direkte i appen og foelger derfor brugerens sprogvalg.
const T = (lang, da, en) => (lang === 'en' ? en : da);

// Rate limiting: max 5 reports per user per hour (in-memory, resets on cold start)
const reportCounts = new Map();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const lang = await getUserLanguage(base44, user?.email);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limit
    const key = user.email;
    const now = Date.now();
    const entry = reportCounts.get(key) || { count: 0, resetAt: now + 3600000 };
    if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + 3600000; }
    if (entry.count >= 5) {
      return Response.json({ error: T(lang, 'For mange indberetninger. Prøv igen om en time.', 'Too many reports. Try again in an hour.') }, { status: 429 });
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
      return Response.json({ error: T(lang, 'Du kan ikke indberette dig selv', 'You cannot report yourself') }, { status: 400 });
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