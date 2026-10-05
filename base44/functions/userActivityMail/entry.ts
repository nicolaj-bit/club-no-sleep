import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { SUBSCRIPTION_ADMIN_EMAILS } from '../../shared/adminEmails.js';

/**
 * Sender mail til admin når der sker noget med en brugerprofil.
 * Kaldes af workflow "Bruger-aktivitet mail" (entity-trigger på UserProfile).
 * Body: { event_type: 'create'|'update'|'delete', entity_id, data, old_data, changed_fields }
 */
const esc = (v) => {
  if (v === null || v === undefined || v === '') return '<em>tom</em>';
  const s = typeof v === 'boolean' ? (v ? 'ja' : 'nej') : String(v);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const b = await req.json().catch(() => ({}));
    const data = b.data || {};
    const oldData = b.old_data || {};
    const eventType = b.event_type;
    const now = new Date().toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' });
    const email = data.user_email || oldData.user_email || b.entity_id || 'ukendt';

    let subject = '';
    let body = '';

    if (eventType === 'create') {
      subject = 'Ny bruger i Club No Sleep';
      const rows = [
        ['Email', data.user_email],
        ['Brugernavn', data.username],
        ['Navn', data.display_name],
        ['Profil', data.profile_label],
        ['By', data.city],
        ['Inviteret af', data.is_invited ? data.inviter_email : null],
      ];
      body = rows
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `<p><strong>${k}:</strong> ${esc(v)}</p>`)
        .join('\n');
    } else if (eventType === 'update') {
      subject = 'Brugerændring i Club No Sleep';
      body = `<p><strong>Bruger:</strong> ${esc(email)}`;
      if (data.username) body += ` (${esc(data.username)})`;
      body += '</p>';
      const changed = b.changed_fields || [];
      if (changed.length) {
        body += changed
          .map((f) => `<p><strong>${esc(f)}:</strong> ${esc(oldData[f])} &rarr; ${esc(data[f])}</p>`)
          .join('\n');
      } else {
        body += '<p><em>Ingen feltændringer registreret.</em></p>';
      }
    } else if (eventType === 'delete') {
      subject = 'Bruger slettet i Club No Sleep';
      body = `<p><strong>Bruger:</strong> ${esc(email)}</p>`;
      if (data.username) body += `<p><strong>Brugernavn:</strong> ${esc(data.username)}</p>`;
      if (data.display_name) body += `<p><strong>Navn:</strong> ${esc(data.display_name)}</p>`;
    } else {
      return Response.json({ skipped: true, reason: `ukendt event_type: ${eventType}` });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: SUBSCRIPTION_ADMIN_EMAILS.join(', '),
      from_name: 'Club No Sleep Brugere',
      subject,
      body: `<h2>${subject}</h2><hr />${body}<hr /><p><strong>Tidspunkt:</strong> ${now}</p>`,
    });

    console.log(`[userActivityMail] admin mail sendt: ${subject} (${email})`);
    return Response.json({ sent: true, event_type: eventType, email });
  } catch (error) {
    console.error('[userActivityMail] Fejl:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});