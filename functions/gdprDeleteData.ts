import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const deleteType = body.type || 'all'; // 'all' | 'chat' | 'location'

    if (deleteType === 'chat' || deleteType === 'all') {
      // Delete all chat messages
      const messages = await base44.entities.ChatMessage.filter({ sender_email: user.email });
      for (const msg of messages) {
        await base44.entities.ChatMessage.delete(msg.id);
      }
    }

    if (deleteType === 'location' || deleteType === 'all') {
      // Remove location from profile
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      if (profiles[0]) {
        await base44.entities.UserProfile.update(profiles[0].id, {
          latitude: null,
          longitude: null,
          location_enabled: false,
        });
      }
    }

    if (deleteType === 'all') {
      // Delete sleep logs
      const sleepLogs = await base44.entities.SleepLog.filter({ user_email: user.email });
      for (const log of sleepLogs) {
        await base44.entities.SleepLog.delete(log.id);
      }
      // Delete profile
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      if (profiles[0]) {
        await base44.entities.UserProfile.delete(profiles[0].id);
      }
    }

    // Audit log
    await base44.entities.AuditLog.create({
      admin_email: user.email,
      action: 'delete_user_data',
      affected_user_email: user.email,
      details: `Self-service GDPR data deletion: ${deleteType}`,
      timestamp: new Date().toISOString(),
    });

    return Response.json({ success: true, deleted: deleteType });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});