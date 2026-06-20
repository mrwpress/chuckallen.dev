interface Env {
  MAILGUN_API_KEY: string;
  MAILGUN_DOMAIN: string;
  TURNSTILE_SECRET_KEY: string;
}

interface ContactBody {
  email: string;
  message: string;
  source?: string;
  token?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://chuckallen.dev',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const TO_ADDRESS = 'chuck@chuckallen.dev';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(email: string, message: string, source: string): string {
  return [
    '<html><body style="font-family:sans-serif;color:#222;">',
    '<h2 style="color:#0076ff;">New Contact Form Submission</h2>',
    `<p><strong>From:</strong> ${escapeHtml(email)}</p>`,
    `<p><strong>Source:</strong> ${escapeHtml(source)}</p>`,
    '<hr style="border:none;border-top:1px solid #ddd;">',
    `<p style="white-space:pre-wrap;">${escapeHtml(message)}</p>`,
    '</body></html>',
  ].join('\n');
}

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as ContactBody;
    const { email, message, source = 'chat', token } = body;

    if (!token) {
      return jsonResponse({ error: 'Verification required.' }, 400);
    }

    // Verify Turnstile token
    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: context.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: context.request.headers.get('CF-Connecting-IP') || '',
      }),
    });
    const turnstileData = await turnstileRes.json<{ success: boolean }>();
    if (!turnstileData.success) {
      return jsonResponse({ error: 'Verification failed. Please try again.' }, 403);
    }

    if (!email || !message) {
      return jsonResponse({ error: 'Email and message are required.' }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: 'Invalid email address.' }, 400);
    }

    if (email.length > 254 || message.length > 5000) {
      return jsonResponse({ error: 'Input too long.' }, 400);
    }

    const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = context.env;
    const from = `ChuckAllen.dev Contact <noreply@${MAILGUN_DOMAIN}>`;
    const subject = `New message from ${email}`;
    const html = buildHtml(email, message, source);

    const formData = new FormData();
    formData.append('from', from);
    formData.append('to', TO_ADDRESS);
    formData.append('h:Reply-To', email);
    formData.append('subject', subject);
    formData.append('html', html);

    const res = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      return jsonResponse({
        error: 'Failed to send message. Please try again.',
        debug: { status: res.status, body: err, domain: MAILGUN_DOMAIN },
      }, 500);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return jsonResponse({ error: 'Failed to send message. Please try again.' }, 500);
  }
};
