import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { normalizeLanguage } from '../../shared/i18n.js';

// Send email-notifikation til alle brugere (OneSignal er fjernet)
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, message, url, title_en, message_en } = await req.json();

    if (!title || !message) {
      return Response.json({ error: 'title og message er påkrævet' }, { status: 400 });
    }

    const profiles = await base44.asServiceRole.entities.UserProfile.list();

    let sent = 0;
    for (const profile of profiles) {
      if (!profile.user_email) continue;
      // Hver bruger faar mailen paa sit eget sprog. Er der ikke skrevet en
      // engelsk udgave, faar alle den danske — bedre end ingen besked.
      const lang = normalizeLanguage(profile.language);
      const subj = lang === 'en' ? (title_en || title) : title;
      const msg = lang === 'en' ? (message_en || message) : message;
      const readMore = lang === 'en' ? 'Read more' : 'Læs mere';
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: profile.user_email,
        subject: subj,
        body: `<p>${msg}</p>${url ? `<p><a href="${url}">${readMore}</a></p>` : ''}`,
      });
      sent++;
    }

    console.log('Email notifikationer sendt til:', sent, 'brugere');
    return Response.json({ success: true, emails_sent: sent });
  } catch (error) {
    console.error('sendPushNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});