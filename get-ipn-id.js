const https = require('https');

const CONSUMER_KEY = process.env.PESAPAY_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.PESAPAY_CONSUMER_SECRET;
const BASE_URL = process.env.PESAPAY_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3';

function request(url, options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    console.error('Missing PESAPAY_CONSUMER_KEY or PESAPAY_CONSUMER_SECRET env vars');
    process.exit(1);
  }

  const host = new URL(BASE_URL).host;
  const tokenRes = await request(
    `${BASE_URL}/api/Auth/RequestToken`,
    { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } },
    JSON.stringify({ consumer_key: CONSUMER_KEY, consumer_secret: CONSUMER_SECRET })
  );

  const tokenData = JSON.parse(tokenRes.body);
  if (!tokenData.token) {
    console.error('Auth failed:', JSON.stringify(tokenData, null, 2));
    process.exit(1);
  }

  const ipnRes = await request(
    `${BASE_URL}/api/URLSetup/GetRegisteredIpn`,
    { method: 'GET', headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${tokenData.token}` } }
  );

  console.log('IPN List:', JSON.stringify(JSON.parse(ipnRes.body), null, 2));
}

main().catch(console.error);
