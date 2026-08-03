import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Opretter en Favorite med item_type 'milestone' for den autentificerede bruger
// via asServiceRole, da RLS create blokerer direkte oprettelse for email/password-brugere.
// Forventer: { title, date, image_url, frame_id }
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const title = (body.title || 'Milepæl').toString().slice(0, 200);
    const date = (body.date || '').toString().slice(0, 100);
    const image_url = (body.image_url || '').toString();
    const frame_id = (body.frame_id || '').toString();

    if (!image_url) return Response.json({ error: 'image_url mangler' }, { status: 400 });

    const favorite = await base44.asServiceRole.entities.Favorite.create({
      user_email: user.email,
      item_type: 'milestone',
      item_id: frame_id || `milestone-${Date.now()}`,
      item_title: title,
      item_image: image_url,
      item_date: date,
    });

    return Response.json({ success: true, favorite });
  } catch (error) {
    console.error('createMilestoneFavorite error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}