import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Returns ONLY the currently logged-in user's context (name, email, child info).
// Used by in-app agents so they never pick up another (visible) user's name.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let profile = null;
    let children = [];
    try {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      profile = profiles?.[0] || null;
    } catch (e) {
      console.log('getCurrentUserContext: could not load profile', e?.message);
    }
    try {
      children = await base44.entities.Child.filter({ user_email: user.email });
    } catch (e) {
      console.log('getCurrentUserContext: could not load children', e?.message);
    }

    const name =
      profile?.display_name ||
      profile?.username ||
      user?.full_name ||
      null;

    return Response.json({
      email: user.email,
      name: name,
      display_name: profile?.display_name || null,
      username: profile?.username || null,
      profile_label: profile?.profile_label || null,
      gender: profile?.gender || null,
      child_name: children?.[0]?.name || null,
      child_birthdate: children?.[0]?.birthdate || profile?.child_birthdate || null,
      child_due_date: children?.[0]?.due_date || profile?.child_due_date || null,
    });
  } catch (e) {
    console.log('getCurrentUserContext error', e?.message);
    return Response.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}