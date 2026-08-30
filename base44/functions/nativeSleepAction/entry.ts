import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { resolveOwnerEmail, executeSleepAction } from '../../shared/sleepActions.ts';

// ============================================================================
// nativeSleepAction — afslut/markér vågen på en søvnlog UDEN login.
// Bruges af native låseskærm-knapper (Stop/Pause).
//
// Autentificering sker via native_action_token på UserProfile.
// Tillader kun handlingerne mark_awake og end — aldrig start eller undo.
// ============================================================================

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token, session_id, at, action: rawAction } = body;

    // Den native klient sender 'awake'; handlingen hedder 'mark_awake' her.
    // Der mappes før validering, så builds i App Store med den gamle streng
    // bliver ved med at virke.
    const action = rawAction === 'awake' ? 'mark_awake' : rawAction;

    // Kun mark_awake og end er tilladt fra native
    if (action !== 'mark_awake' && action !== 'end') {
      return Response.json(
        { error: 'Ugyldig handling — kun mark_awake og end tilladt' },
        { status: 400 }
      );
    }

    // Token skal være til stede og ikke tom
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return Response.json({ error: 'Token mangler eller er tom' }, { status: 401 });
    }

    // Find bruger via token (asServiceRole — ingen login krævet)
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      native_action_token: token,
    });
    const profile = profiles?.[0];
    if (!profile) {
      return Response.json({ error: 'Ugyldigt token' }, { status: 401 });
    }

    // Resolve owner email — håndtér inviterede familiemedlemmer
    const ownerResult = await resolveOwnerEmail(base44, profile);
    if (ownerResult.error) {
      return Response.json(ownerResult.error.body, { status: ownerResult.error.status });
    }

    // Udfør handlingen (samme logik som manageSleepSession)
    const result = await executeSleepAction(base44, ownerResult.ownerEmail, action, session_id, at);
    return Response.json(result.body, { status: result.status });
  } catch (error) {
    console.error('nativeSleepAction error:', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}