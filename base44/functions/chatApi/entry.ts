import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Central chat-API — al læsning/skrivning af ChatConversation og ChatMessage
// går gennem asServiceRole, så email/password-brugere (som ikke genkendes af
// RLS) stadig kan læse og sende beskeder. Hver handling verificerer, at den
// indloggede brugers email står i participants — id'er fra frontend stoles aldrig på.

async function findConversation(svc, id) {
  if (!id) return null;
  const convs = await svc.entities.ChatConversation.filter({ id });
  return convs?.[0] || null;
}

function isParticipant(conv, email) {
  return Array.isArray(conv?.participants) && conv.participants.includes(email);
}

async function getProfile(svc, email) {
  if (!email) return null;
  const rows = await svc.entities.UserProfile.filter({ user_email: email });
  return rows?.[0] || null;
}

async function isBlockedEitherWay(svc, emailA, emailB) {
  const rows = await svc.entities.BlockedUser.filter({
    $or: [
      { blocker_email: emailA, blocked_email: emailB },
      { blocker_email: emailB, blocked_email: emailA },
    ],
  });
  return !!(rows && rows.length > 0);
}

// Kun mor-profiler og administratorer må skrive/starte samtaler.
async function canWrite(svc, user) {
  if (user?.role === 'admin') return true;
  const profile = await getProfile(svc, user.email);
  return profile?.profile_label === 'mor';
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // --- Oversigt: alle samtaler brugeren deltager i ---
    if (action === 'list_conversations') {
      const convs = await svc.entities.ChatConversation.filter(
        { participants: user.email },
        '-last_message_at',
        200
      );
      return Response.json({ conversations: convs || [] });
    }

    // --- Én samtale + modpartens online-status ---
    if (action === 'get_conversation') {
      const conv = await findConversation(svc, body.conversation_id);
      if (!conv) return Response.json({ error: 'Not found' }, { status: 404 });
      if (!isParticipant(conv, user.email)) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const otherEmail = conv.participants.find((p) => p !== user.email);
      let otherIsOnline = false;
      if (otherEmail) {
        const p = await getProfile(svc, otherEmail);
        otherIsOnline = p?.is_online === true;
      }
      return Response.json({ conversation: conv, other_is_online: otherIsOnline });
    }

    // --- Beskeder i en samtale (kun nye siden et tidsstempel) ---
    if (action === 'list_messages') {
      const conv = await findConversation(svc, body.conversation_id);
      if (!conv) return Response.json({ error: 'Not found' }, { status: 404 });
      if (!isParticipant(conv, user.email)) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const query = { conversation_id: body.conversation_id };
      if (body.since) query.created_date = { $gt: body.since };
      const messages = await svc.entities.ChatMessage.filter(query, 'created_date', 500);
      return Response.json({ messages: messages || [] });
    }

    // --- Send besked (opretter + opdaterer last_message i ét kald) ---
    if (action === 'send_message') {
      const conv = await findConversation(svc, body.conversation_id);
      if (!conv) return Response.json({ error: 'Not found' }, { status: 404 });
      if (!isParticipant(conv, user.email)) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const content = (body.content || '').toString().slice(0, 1000).trim();
      if (!content) return Response.json({ error: 'Empty message' }, { status: 400 });
      const allowed = await canWrite(svc, user);
      if (!allowed) return Response.json({ error: 'Only moms can send messages' }, { status: 403 });
      const otherEmail = conv.participants.find((p) => p !== user.email);
      if (otherEmail && (await isBlockedEitherWay(svc, user.email, otherEmail))) {
        return Response.json({ error: 'blocked' }, { status: 403 });
      }
      const profile = await getProfile(svc, user.email);
      const now = new Date().toISOString();
      const message = await svc.entities.ChatMessage.create({
        conversation_id: conv.id,
        sender_email: user.email,
        sender_username: profile?.username || user.full_name,
        sender_image: profile?.profile_image,
        content,
      });
      await svc.entities.ChatConversation.update(conv.id, {
        last_message: content,
        last_message_at: now,
      });
      return Response.json({ message, conversation_id: conv.id });
    }

    // --- Start samtale (idempotent: returnerer eksisterende 1:1) ---
    if (action === 'start_conversation') {
      const targetEmail = body.target_email;
      if (!targetEmail || targetEmail === user.email) {
        return Response.json({ error: 'Invalid target' }, { status: 400 });
      }
      const allowed = await canWrite(svc, user);
      if (!allowed) return Response.json({ error: 'Only moms can start conversations' }, { status: 403 });
      if (await isBlockedEitherWay(svc, user.email, targetEmail)) {
        return Response.json({ error: 'blocked' }, { status: 403 });
      }
      const existing = await svc.entities.ChatConversation.filter(
        { participants: user.email },
        '-last_message_at',
        200
      );
      const match = (existing || []).find(
        (c) =>
          Array.isArray(c.participants) &&
          c.participants.length === 2 &&
          c.participants.includes(targetEmail) &&
          !c.is_group
      );
      if (match) return Response.json({ conversation: match });
      const profile = await getProfile(svc, user.email);
      const conv = await svc.entities.ChatConversation.create({
        participants: [user.email, targetEmail],
        participant_usernames: [profile?.username || user.full_name, body.target_username || ''],
        participant_images: [profile?.profile_image || '', body.target_image || ''],
        is_group: false,
      });
      return Response.json({ conversation: conv });
    }

    // --- Marker som læst (tidsstempel + ryd ulæste) ---
    if (action === 'mark_read') {
      const conv = await findConversation(svc, body.conversation_id);
      if (!conv) return Response.json({ error: 'Not found' }, { status: 404 });
      if (!isParticipant(conv, user.email)) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const now = new Date().toISOString();
      const readAt = { ...(conv.read_at || {}) };
      readAt[user.email] = now;
      await svc.entities.ChatConversation.update(conv.id, { read_at: readAt });
      // Markér indgående (ikke egne) ulæste beskeder som læste
      const unread = await svc.entities.ChatMessage.filter(
        { conversation_id: conv.id, is_read: false },
        'created_date',
        500
      );
      const inbound = (unread || []).filter((m) => m.sender_email !== user.email);
      if (inbound.length > 0) {
        await svc.entities.ChatMessage.bulkUpdate(
          inbound.map((m) => ({ id: m.id, is_read: true }))
        );
      }
      return Response.json({ ok: true, read_at: readAt });
    }

    // --- Er der ulæste beskeder (til den røde prik)? ---
    if (action === 'has_unread') {
      const convs = await svc.entities.ChatConversation.filter(
        { participants: user.email },
        '-last_message_at',
        200
      );
      const convIds = new Set((convs || []).map((c) => c.id));
      if (convIds.size === 0) return Response.json({ has_unread: false, count: 0 });
      const msgs = await svc.entities.ChatMessage.filter(
        { is_read: false },
        'created_date',
        500
      );
      const unread = (msgs || []).filter(
        (m) => convIds.has(m.conversation_id) && m.sender_email !== user.email
      );
      return Response.json({ has_unread: unread.length > 0, count: unread.length });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('chatApi error:', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}