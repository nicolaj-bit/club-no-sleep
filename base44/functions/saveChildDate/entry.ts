import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Gemmer barnets fødsels- eller terminsdato via asServiceRole, så email/password-
// brugere (som ikke genkendes af RLS) også kan gemme. Opretter en Child-post hvis
// ingen findes; ellers opdateres den eksisterende (eller den aktive) med datoen.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const field = body.field; // 'birthdate' | 'due_date'
    const value = body.value; // ISO dato
    const childId = body.child_id;

    if (field !== 'birthdate' && field !== 'due_date') {
      return Response.json({ error: 'Invalid field' }, { status: 400 });
    }
    if (!value) return Response.json({ error: 'Missing value' }, { status: 400 });

    const existing = await svc.entities.Child.filter({ user_email: user.email }, 'order', 50);
    let child;
    if (existing && existing.length > 0) {
      child = (childId && existing.find((c) => c.id === childId)) || existing[0];
      child = await svc.entities.Child.update(child.id, { [field]: value });
    } else {
      child = await svc.entities.Child.create({
        user_email: user.email,
        name: 'Mit barn',
        [field]: value,
      });
    }
    return Response.json({ ok: true, child });
  } catch (error) {
    console.error('saveChildDate error:', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}