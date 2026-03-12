import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { action, target_id, target_user_email, note } = body;

    let result = {};

    if (action === 'delete_message') {
      await base44.asServiceRole.entities.ChatMessage.delete(target_id);
      result = { deleted: 'message', id: target_id };
    }

    if (action === 'delete_conversation') {
      // Delete all messages in conversation first
      const messages = await base44.asServiceRole.entities.ChatMessage.filter({ conversation_id: target_id });
      for (const msg of messages) {
        await base44.asServiceRole.entities.ChatMessage.delete(msg.id);
      }
      await base44.asServiceRole.entities.ChatConversation.delete(target_id);
      result = { deleted: 'conversation', id: target_id };
    }

    if (action === 'ban_user') {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: target_user_email });
      if (profiles[0]) {
        await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
          is_visible: false,
          is_banned: true,
        });
      }
      result = { banned: target_user_email };
    }

    if (action === 'review_report') {
      await base44.asServiceRole.entities.Report.update(target_id, {
        status: 'reviewed',
        admin_note: note || '',
      });
      result = { reviewed: target_id };
    }

    if (action === 'dismiss_report') {
      await base44.asServiceRole.entities.Report.update(target_id, {
        status: 'dismissed',
        admin_note: note || '',
      });
      result = { dismissed: target_id };
    }

    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      admin_email: user.email,
      action: action === 'delete_message' ? 'delete_message'
        : action === 'delete_conversation' ? 'delete_conversation'
        : action === 'ban_user' ? 'ban_user'
        : 'review_report',
      affected_user_email: target_user_email || '',
      details: note || '',
      timestamp: new Date().toISOString(),
    });

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});