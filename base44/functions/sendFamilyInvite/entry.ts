import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invitee_email, invitee_title, inviter_name, invite_id } = await req.json();

    if (!invitee_email || !invitee_title) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    const appUrl = `https://clubnosleep.com/AcceptInvite?invite=${invite_id}`;

    await base44.integrations.Core.SendEmail({
      to: invitee_email,
      subject: `${inviter_name} inviterer dig til LALATOTO 🤍`,
      body: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #FAF6F1; border-radius: 20px;">
          <h1 style="font-size: 28px; color: #2C1A0E; margin-bottom: 8px;">En invitation til dig 🤍</h1>
          <p style="color: #6B4A2F; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            <strong>${inviter_name}</strong> har inviteret dig som <strong>${invitee_title}</strong> til at følge med i LALATOTO — appen der hjælper familier med at følge barnets udvikling, søvn og milepæle.
          </p>
          <p style="color: #6B4A2F; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
            Du får adgang til netop det, ${inviter_name} har valgt at dele med dig — og du kan modtage notifikationer om barnets tigerspring og vigtige aftaler.
          </p>
          <a href="${appUrl}" style="display: inline-block; background: #5C3317; color: #FAF6F1; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 15px; font-weight: 600;">
            Acceptér invitation
          </a>
          <p style="color: #9C816A; font-size: 13px; margin-top: 16px;">
            Du opretter en konto med blot dit navn og password — og får automatisk adgang via ${inviter_name}s abonnement. Du skal ikke betale noget.
          </p>
          <p style="color: #9C816A; font-size: 13px; margin-top: 32px;">
            Har du spørgsmål? Skriv til hej@lalatoto.dk
          </p>
        </div>
      `,
    });

    console.log(`Family invite sent from ${user.email} to ${invitee_email} (${invitee_title})`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('sendFamilyInvite error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});