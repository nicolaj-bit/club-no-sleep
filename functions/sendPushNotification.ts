import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, message, url } = await req.json();

    if (!title || !message) {
      return Response.json({ error: 'title og message er påkrævet' }, { status: 400 });
    }

    const appId = Deno.env.get('ONESIGNAL_APP_ID');
    const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    const body = {
      app_id: appId,
      included_segments: ['All'],
      headings: { en: title, da: title },
      contents: { en: message, da: message },
    };

    if (url) body.url = url;

    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data }, { status: 500 });
    }

    return Response.json({ success: true, recipients: data.recipients });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});