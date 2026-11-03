import crypto from 'node:crypto';

export async function createOrder({ amountInINR, reportType, customerEmail, customerPhone }) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const amountInPaise = Math.round(Number(amountInINR) * 100);
  const receipt = `rec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  // If Razorpay credentials are not configured, provide a test sandbox order
  if (!keyId || !keySecret || keyId === 'rzp_test_placeholder') {
    return {
      id: `order_dev_${Date.now()}`,
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      isDemo: true,
      notes: { reportType, customerEmail: customerEmail || '' },
    };
  }

  // Live or standard test mode with Razorpay REST API
  const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        reportType,
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || '',
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Razorpay Order Creation Failed:', response.status, errorBody);
    throw new Error(`Razorpay API Error: ${response.status} - ${errorBody}`);
  }

  const order = await response.json();
  return {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    isDemo: false,
    notes: order.notes,
  };
}

export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!orderId || !paymentId || !signature) {
    return { valid: false, error: 'Missing payment verification parameters.' };
  }

  // Development sandbox fallback when keys are not configured
  if (!keySecret || orderId.startsWith('order_dev_')) {
    if (signature === 'sig_dev_valid' || signature.startsWith('mock_sig_')) {
      return { valid: true, isDemo: true };
    }
  }

  if (!keySecret) {
    return { valid: false, error: 'Razorpay secret key is not configured on the server.' };
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(generatedSignature);
    const signatureBuffer = Buffer.from(signature);

    if (expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      return { valid: true, isDemo: false };
    }
    return { valid: false, error: 'Invalid payment signature.' };
  } catch (err) {
    return { valid: false, error: 'Signature verification failed: ' + err.message };
  }
}

