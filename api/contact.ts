interface ApiRequest {
  method?: string;
  body?: unknown;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
}

interface ContactForm {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isText(value: unknown, maxLength: number): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

export default async function handler(
  request: ApiRequest,
  response: ApiResponse
): Promise<void> {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({error: 'method_not_allowed'});
    return;
  }

  const form =
    request.body && typeof request.body === 'object'
      ? (request.body as ContactForm)
      : {};

  if (typeof form.website === 'string' && form.website.trim()) {
    response.status(200).json({ok: true});
    return;
  }

  if (
    !isText(form.name, 120) ||
    !isText(form.email, 254) ||
    !EMAIL_PATTERN.test(form.email) ||
    !isText(form.subject, 160) ||
    !isText(form.message, 5000)
  ) {
    response.status(400).json({error: 'invalid_form'});
    return;
  }

  const env = (
    globalThis as typeof globalThis & {
      process?: {env?: Record<string, string | undefined>};
    }
  ).process?.env;
  const accessKey = env?.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    response.status(503).json({error: 'contact_not_configured'});
    return;
  }

  try {
    const providerResponse = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify({
        access_key: accessKey,
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        from_name: 'Pad2PS — Contato pelo site',
      }),
    });

    const result = (await providerResponse.json()) as {success?: boolean};
    if (!providerResponse.ok || result.success !== true) {
      response.status(502).json({error: 'contact_delivery_failed'});
      return;
    }
    response.status(200).json({ok: true});
  } catch {
    response.status(502).json({error: 'contact_delivery_failed'});
  }
}
