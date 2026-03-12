import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [profiles, messages, conversations, sleepLogs, consentLogs] = await Promise.all([
      base44.entities.UserProfile.filter({ user_email: user.email }),
      base44.entities.ChatMessage.filter({ sender_email: user.email }),
      base44.entities.ChatConversation.filter({ participants: user.email }),
      base44.entities.SleepLog.filter({ user_email: user.email }),
      base44.entities.ConsentLog.filter({ user_email: user.email }),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user: { email: user.email, full_name: user.full_name, created_date: user.created_date },
      profile: profiles[0] || null,
      chat_messages: messages,
      conversations: conversations,
      sleep_logs: sleepLogs,
      consent_logs: consentLogs,
    };

    // Audit log
    await base44.entities.AuditLog.create({
      admin_email: user.email,
      action: 'export_user_data',
      affected_user_email: user.email,
      details: 'Self-service GDPR data export',
      timestamp: new Date().toISOString(),
    });

    return Response.json({ success: true, data: exportData });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});