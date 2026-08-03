import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { item_id, item_title, item_image } = body || {};
    if (!item_id) return Response.json({ error: 'item_id required' }, { status: 400 });

    // Tjek om favoritten allerede findes for denne bruger + blogindlæg
    const existing = await base44.asServiceRole.entities.Favorite.filter({
      user_email: user.email,
      item_type: 'blog',
      item_id,
    });

    if (existing && existing.length > 0) {
      await base44.asServiceRole.entities.Favorite.delete(existing[0].id);
      return Response.json({ ok: true, action: 'removed', isSaved: false });
    }

    const created = await base44.asServiceRole.entities.Favorite.create({
      user_email: user.email,
      item_type: 'blog',
      item_id,
      item_title,
      item_image,
    });
    return Response.json({ ok: true, action: 'added', isSaved: true, favorite: created });
  } catch (error) {
    console.error('toggleBlogFavorite error:', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}