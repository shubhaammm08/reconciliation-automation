import crypto from 'node:crypto';

const AUTH_SECRET = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_PASSWORD || 'recon_admin_secret_key_2026';

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

export function loginAdmin(password) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (!password || password !== adminPassword) {
    return { success: false, error: 'Invalid admin credentials.' };
  }

  const payload = {
    sub: 'admin',
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  const payloadStr = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payloadStr).digest('hex');
  const token = `${payloadStr}.${signature}`;

  return { success: true, token, expiresIn: 86400 };
}

export function verifyAdminToken(token) {
  if (!token) {
    return { valid: false, error: 'Authorization token required.' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed token.' };
  }

  const [payloadStr, signature] = parts;
  try {
    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(payloadStr).digest('hex');

    const expectedBuf = Buffer.from(expectedSignature);
    const sigBuf = Buffer.from(signature);

    if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
      return { valid: false, error: 'Invalid token signature.' };
    }

    const payload = JSON.parse(base64UrlDecode(payloadStr));
    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Token has expired.' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Token verification failed: ' + err.message };
  }
}

export function getBearerToken(reqHeaders) {
  const auth = reqHeaders['authorization'] || reqHeaders['Authorization'] || '';
  if (auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  return null;
}

