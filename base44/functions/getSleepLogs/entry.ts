import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Returnerer den fulde søvnlog-historik for den indloggede bruger — asServiceRole,
// så RLS-udfordringer for email/password-brugere omgås.
//
// - Hovedbruger (ikke inviteret): alle SleepLog-poster hvor user_email === egen email.
// - Inviteret bruger med accepted FamilyInvite og can_see_sleep_log === true:
//   alle SleepLog-poster for inviter_email (ejerens/barnets logs).
// - Inviteret uden søvnlog-adgang: tom liste.
//
// Sorteres nyeste først (efter dato). Hele historikken returneres.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Find brugerens profil for at afgøre om de er inviteret
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email });
    const profile = profiles?.[0];

    let ownerEmail = user.email;

    if (profile?.is_invited) {
      // Find accepted invitation (ignorer selv-referencer / ugyldige data)
      const invites = await base44.asServiceRole.entities.FamilyInvite.filter(
        { invitee_email: user.email },
        '-created_date',
        10
      );
      const invite = invites?.find(i => i.status === 'accepted' && i.inviter_email && i.inviter_email !== user.email);
      if (invite) {
        // Gyldig invitation — honorer tilladelse
        if (invite.can_see_sleep_log === false) {
          return Response.json({ sleep_logs: [], is_invited: true, has_access: false });
        }
        ownerEmail = invite.inviter_email;
      }
      // Ingen gyldig invitation → fald tilbage til egne logs (håndterer inkonsistent profil-data)
    }

    // Hent HELE historikken for ejeren, nyeste først
    const logs = await base44.asServiceRole.entities.SleepLog.filter(
      { user_email: ownerEmail },
      '-date',
      1000
    );

    return Response.json({
      sleep_logs: logs || [],
      is_invited: !!(profile?.is_invited),
      has_access: true,
    });
  } catch (error) {
    console.error('getSleepLogs error:', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}