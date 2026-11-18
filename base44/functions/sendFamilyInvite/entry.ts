import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { getUserLanguage } from '../../shared/i18n.js';

// Invitationen gaar til en, der endnu ikke er bruger, saa der er ikke noget
// sprog paa hende. Afsenderens sprog er det bedste gaet: hun inviterer typisk
// sin partner, og de taler samme sprog.
const T = (lang, da, en) => (lang === 'en' ? en : da);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      invitee_email,
      invitee_title,
      inviter_email,
      inviter_name,
      invite_id,
      can_see_sleep_log,
      can_see_wonder_weeks,
      can_see_calendar,
      can_see_knowledge,
      can_see_milestones,
      notify_wonder_weeks,
      notify_sleep,
      notify_calendar,
      description,
    } = await req.json();

    if (!invitee_email || !invitee_title || !inviter_email) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Sikkerhed: inviter_email skal matche den indloggede bruger
    if (inviter_email !== user.email) {
      return Response.json({ error: 'inviter_email does not match authenticated user' }, { status: 403 });
    }

    // Tjek om der allerede findes en aktiv invitation (pending eller accepted)
    const existingInvites = await base44.asServiceRole.entities.FamilyInvite.filter(
      { inviter_email: user.email },
      '-created_date',
      20
    );
    const activeInvite = existingInvites?.find(i => i.status === 'pending' || i.status === 'accepted');
    if (activeInvite) {
      return Response.json({ error: 'Du kan kun invitere én person. Slet den eksisterende invitation først.', error_en: 'You can only invite one person. Delete the existing invitation first.' }, { status: 409 });
    }

    // Opret FamilyInvite-record med service role (RLS blokerer frontend create)
    const invite = await base44.asServiceRole.entities.FamilyInvite.create({
      inviter_email,
      invitee_email,
      invitee_title,
      can_see_sleep_log: can_see_sleep_log ?? true,
      can_see_wonder_weeks: can_see_wonder_weeks ?? true,
      can_see_calendar: can_see_calendar ?? true,
      can_see_knowledge: can_see_knowledge ?? false,
      can_see_milestones: can_see_milestones ?? true,
      notify_wonder_weeks: notify_wonder_weeks ?? true,
      notify_sleep: notify_sleep ?? false,
      notify_calendar: notify_calendar ?? true,
      status: 'pending',
      description: description || undefined,
    });

    const appStoreUrl = 'https://apps.apple.com/app/id6764388095';
    const lang = await getUserLanguage(base44, user?.email);

    // Branded HTML invitation email
    const html = `<!DOCTYPE html>
    <html lang="${lang}">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background-color:#FAF6F1;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF6F1;padding:40px 20px;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background-color:#FFFDF9;border-radius:16px;overflow:hidden;max-width:560px;">
            <tr><td style="background-color:#5B3F2B;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#FAF6F1;font-size:28px;font-weight:600;letter-spacing:0.05em;">Club No Sleep</h1>
            </td></tr>
            <tr><td style="padding:40px;">
              <p style="margin:0 0 20px;color:#2B1F16;font-size:16px;line-height:1.6;">${T(lang, 'Hej,', 'Hi,')}</p>
              <p style="margin:0 0 28px;color:#2B1F16;font-size:16px;line-height:1.6;">
                ${T(lang, `<strong style="color:#5B3F2B;">${inviter_name}</strong> har inviteret dig til Club No Sleep — en digital babybog og fællesskab for forældre.`, `<strong style="color:#5B3F2B;">${inviter_name}</strong> has invited you to Club No Sleep — a digital baby book and a community for parents.`)}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr><td align="center">
                  <a href="${appStoreUrl}" style="display:inline-block;background-color:#5B3F2B;color:#FAF6F1;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:500;">${T(lang, 'Download på App Store', 'Download on the App Store')}</a>
                </td></tr>
              </table>
              <p style="margin:0 0 12px;color:#2B1F16;font-size:15px;font-weight:600;line-height:1.6;">${T(lang, 'Sådan kommer du i gang:', 'How to get started:')}</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr><td style="padding:6px 0;color:#2B1F16;font-size:15px;line-height:1.6;">
                  <strong style="color:#5B3F2B;">1)</strong>&nbsp; ${T(lang, 'Hent appen.', 'Download the app.')}
                </td></tr>
                <tr><td style="padding:6px 0;color:#2B1F16;font-size:15px;line-height:1.6;">
                  <strong style="color:#5B3F2B;">2)</strong>&nbsp; ${T(lang, `Opret dig med DENNE email: <strong style="color:#5B3F2B;">${invitee_email}</strong>`, `Sign up with THIS email address: <strong style="color:#5B3F2B;">${invitee_email}</strong>`)}
                </td></tr>
                <tr><td style="padding:6px 0;color:#2B1F16;font-size:15px;line-height:1.6;">
                  <strong style="color:#5B3F2B;">3)</strong>&nbsp; ${T(lang, `Så får du automatisk adgang gennem ${inviter_name}.`, `You then get access automatically through ${inviter_name}.`)}
                </td></tr>
              </table>
              <p style="margin:0;color:#7A665A;font-size:13px;line-height:1.6;font-style:italic;">
                ${T(lang, 'Android-versionen kommer snart.', 'The Android version is coming soon.')}
              </p>
            </td></tr>
            <tr><td style="padding:24px 40px 32px;border-top:1px solid #EDE4DB;">
              <p style="margin:0;color:#7A665A;font-size:12px;line-height:1.5;text-align:center;">
                ${T(lang, 'Club No Sleep · Den digitale babybog<br/>Spørgsmål? Skriv til hello@clubnosleep.com', 'Club No Sleep · The digital baby book<br/>Questions? Write to hello@clubnosleep.com')}
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;

    // Send email via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Club No Sleep <hello@clubnosleep.com>',
        to: invitee_email,
        subject: T(lang, `${inviter_name} inviterer dig til Club No Sleep 🤍`, `${inviter_name} is inviting you to Club No Sleep 🤍`),
        html,
      }),
    });

    if (!resendRes.ok) {
      const resendError = await resendRes.text();
      console.error('Resend error:', resendError);
      return Response.json({ error: resendError }, { status: 500 });
    }

    console.log(`Family invite created and email sent from ${user.email} to ${invitee_email} (${invitee_title})`);
    return Response.json({ ok: true, invite });
  } catch (error) {
    console.error('sendFamilyInvite error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});