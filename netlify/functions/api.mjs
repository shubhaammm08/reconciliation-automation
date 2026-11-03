import { handleApiRequest } from '../../server/api-router.mjs';

// Modern Netlify Functions (v2) default export
export default async (req, context) => {
  return handleApiRequest(req);
};

// Legacy Netlify Functions (v1) / AWS Lambda handler export
export async function handler(event, context) {
  try {
    const host = (event.headers && (event.headers.host || event.headers.Host)) || 'localhost';
    const proto = (event.headers && event.headers['x-forwarded-proto']) || 'https';
    let rawPath = event.path || '';
    if (event.rawUrl) {
      try {
        rawPath = new URL(event.rawUrl).pathname;
      } catch {}
    }
    const fullUrl = `${proto}://${host}${rawPath}`;

    const headers = new Headers();
    if (event.headers) {
      for (const [k, v] of Object.entries(event.headers)) {
        if (v != null) headers.set(k, String(v));
      }
    }

    const req = new Request(fullUrl, {
      method: event.httpMethod || 'GET',
      headers,
      body: event.body ? (event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body) : undefined,
    });

    const res = await handleApiRequest(req);
    const bodyText = await res.text();
    const resHeaders = {};
    res.headers.forEach((v, k) => {
      resHeaders[k] = v;
    });

    return {
      statusCode: res.status,
      headers: resHeaders,
      body: bodyText,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
}
