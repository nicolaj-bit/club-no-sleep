import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return Response.json({ error: 'Manglende felter' }, { status: 400 });
  }

  // Fetch contact email from AppConfig
  let toEmail = 'kundeservice@lalatoto.dk'; // fallback
  const configs = await base44.asServiceRole.entities.AppConfig.list();
  if (configs.length > 0 && configs[0].help_contact_email) {
    toEmail = configs[0].help_contact_email;
  }

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: toEmail,
    from_name: 'LALATOTO App',
    subject: `Ny kontaktbesked fra ${name}`,
    body: `
<h2>Ny besked via kontaktformular i appen</h2>
<p><strong>Navn:</strong> ${name}</p>
<p><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
<hr />
<p><strong>Besked:</strong></p>
<p>${message.replace(/\n/g, '<br/>')}</p>
    `.trim(),
  });

  return Response.json({ success: true });
});