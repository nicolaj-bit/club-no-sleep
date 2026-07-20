import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const deleteType = body.type || 'all'; // 'all' | 'chat' | 'location'

    if (deleteType === 'chat' || deleteType === 'all') {
      // Delete all sent chat messages
      const messages = await base44.entities.ChatMessage.filter({ sender_email: user.email });
      for (const msg of messages) {
        await base44.entities.ChatMessage.delete(msg.id);
      }
      // Remove user from conversations (leave all conversations they're part of)
      const conversations = await base44.entities.ChatConversation.filter({ participants: user.email });
      for (const conv of conversations) {
        const remainingParticipants = (conv.participants || []).filter(p => p !== user.email);
        if (remainingParticipants.length === 0) {
          await base44.entities.ChatConversation.delete(conv.id);
        } else {
          // Anonymise the participant slot
          const idx = (conv.participants || []).indexOf(user.email);
          const usernames = [...(conv.participant_usernames || [])];
          const images = [...(conv.participant_images || [])];
          if (idx !== -1) { usernames[idx] = 'Slettet bruger'; images[idx] = null; }
          await base44.entities.ChatConversation.update(conv.id, {
            participants: remainingParticipants,
            participant_usernames: usernames.filter((_, i) => i !== idx || remainingParticipants.length > 0),
            participant_images: images.filter((_, i) => i !== idx || remainingParticipants.length > 0),
          });
        }
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
      // Delete the user account itself (service role needed — built-in RLS blocks self-delete)
      try {
        await base44.asServiceRole.entities.User.delete(user.id);
      } catch (e) {
        console.log('Could not delete user account:', e.message);
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