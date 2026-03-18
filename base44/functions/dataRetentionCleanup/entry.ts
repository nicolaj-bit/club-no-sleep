import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Scheduled job: Deletes/anonymizes data older than 12 months
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled calls (no user) or admin calls
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 12);
    const cutoffISO = cutoffDate.toISOString();

    // Anonymize old chat messages (keep structure, wipe content)
    const allMessages = await base44.asServiceRole.entities.ChatMessage.list('-created_date', 500);
    let anonymizedMessages = 0;
    for (const msg of allMessages) {
      if (msg.created_date < cutoffISO && msg.content !== '[Besked slettet]') {
        await base44.asServiceRole.entities.ChatMessage.update(msg.id, {
          content: '[Besked slettet]',
          sender_email: 'anonymized',
          sender_username: 'Anonym',
          sender_image: null,
        });
        anonymizedMessages++;
      }
    }

    // Delete old sleep logs (older than 12 months)
    const allLogs = await base44.asServiceRole.entities.SleepLog.list('-created_date', 500);
    let deletedLogs = 0;
    for (const log of allLogs) {
      if (log.created_date < cutoffISO) {
        await base44.asServiceRole.entities.SleepLog.delete(log.id);
        deletedLogs++;
      }
    }

    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      admin_email: 'system',
      action: 'delete_user_data',
      affected_user_email: 'all',
      details: `Retention cleanup: ${anonymizedMessages} messages anonymized, ${deletedLogs} sleep logs deleted`,
      timestamp: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      anonymized_messages: anonymizedMessages,
      deleted_sleep_logs: deletedLogs,
      cutoff: cutoffISO,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});