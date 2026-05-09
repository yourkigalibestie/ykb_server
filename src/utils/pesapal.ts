import { env } from '../config/env';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAuthToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const res = await fetch(`${env.PESAPAY_BASE_URL}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      consumer_key: env.PESAPAY_CONSUMER_KEY,
      consumer_secret: env.PESAPAY_CONSUMER_SECRET,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal auth failed (${res.status}): ${text}`);
  }

  const data = await res.json() as Record<string, unknown>;

  const token = typeof data.token === 'string' ? data.token : undefined;
  const err = (data as any).error;
  const errorMessage =
    (typeof err?.code === 'string' ? `[${err.code}] ` : '') +
    ((typeof err?.message === 'string' && err.message) ||
      (typeof data.message === 'string' && data.message) ||
      'No token returned');

  if (!token) {
    throw new Error(`Pesapal auth failed: ${errorMessage}`);
  }

  const expiresAt =
    typeof data.expiryDate === 'string'
      ? new Date(data.expiryDate).getTime()
      : Date.now() + 5 * 60 * 1000;

  cachedToken = { token, expiresAt };
  return token;
}

type SubmitOrderInput = {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address: {
    email_address: string;
    phone_number?: string;
    country_code?: string;
    first_name?: string;
    last_name?: string;
  };
};

type SubmitOrderResult = {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: { message?: string };
};

export async function submitOrder(order: SubmitOrderInput): Promise<SubmitOrderResult> {
  const token = await getAuthToken();

  const res = await fetch(`${env.PESAPAY_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(order),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal submit order failed (${res.status}): ${text}`);
  }

  const data = await res.json() as SubmitOrderResult;

  if (!data.redirect_url || !data.order_tracking_id) {
    throw new Error(`Pesapal submit order failed: ${data.error?.message || 'Invalid response'}`);
  }

  return data;
}

type TransactionStatusResult = {
  payment_status_description: string;
  payment_status_code: string;
  amount: number;
  currency: string;
  error?: { message?: string };
};

export async function getTransactionStatus(orderTrackingId: string): Promise<TransactionStatusResult> {
  const token = await getAuthToken();

  const res = await fetch(
    `${env.PESAPAY_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal status check failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<TransactionStatusResult>;
}
