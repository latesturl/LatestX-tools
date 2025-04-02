const axios = require('axios');
const { setTimeout } = require('timers/promises');

// KONFIGURASI
const config = {
  TARGET_URL: 'http://localhost:3000', // GANTI dengan URL ANDA
  MAX_REQUESTS: 20,                   // Jumlah request total
  DELAY_MS: 200,                      // Delay antar batch (milidetik)
  CONCURRENT_REQUESTS: 3,             // Request paralel per batch
  LOG_SUCCESS: true,                  // Tampilkan log request sukses
  LOG_ERRORS: true                    // Tampilkan log error
};

async function sendRequest(url, requestId) {
  try {
    const start = Date.now();
    const response = await axios.get(url);
    const duration = Date.now() - start;
    
    if (config.LOG_SUCCESS) {
      console.log(`[${requestId}] Status: ${response.status} | Time: ${duration}ms`);
    }
    return { status: response.status, duration };
  } catch (error) {
    if (config.LOG_ERRORS) {
      console.error(`[${requestId}] Error: ${error.message}`);
    }
    return { status: null, error: error.message };
  }
}

async function runLoadTest() {
  console.log('================================');
  console.log('MEMULAI LOAD TESTING');
  console.log(`Target: ${config.TARGET_URL}`);
  console.log(`Total Requests: ${config.MAX_REQUESTS}`);
  console.log(`Concurrent: ${config.CONCURRENT_REQUESTS}/batch`);
  console.log('================================\n');
  
  console.log('PERINGATAN: Hanya gunakan untuk website milik sendiri atau dengan izin tertulis!\n');

  const results = [];
  const batches = Math.ceil(config.MAX_REQUESTS / config.CONCURRENT_REQUESTS);
  
  for (let batch = 0; batch < batches; batch++) {
    const batchPromises = [];
    const requestsInBatch = Math.min(
      config.CONCURRENT_REQUESTS, 
      config.MAX_REQUESTS - (batch * config.CONCURRENT_REQUESTS)
    );
    
    for (let i = 0; i < requestsInBatch; i++) {
      const requestId = batch * config.CONCURRENT_REQUESTS + i + 1;
      batchPromises.push(sendRequest(config.TARGET_URL, requestId));
    }
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    if (batch < batches - 1) {
      await setTimeout(config.DELAY_MS);
    }
  }
  
  // Analisis hasil
  const successfulRequests = results.filter(r => r.status === 200).length;
  const averageTime = results.filter(r => r.status === 200)
                           .reduce((sum, r) => sum + r.duration, 0) / successfulRequests || 0;
  
  console.log('\n================================');
  console.log('HASIL TESTING');
  console.log(`Total Requests: ${results.length}`);
  console.log(`Success: ${successfulRequests}`);
  console.log(`Error: ${results.length - successfulRequests}`);
  console.log(`Average Response Time: ${averageTime.toFixed(2)}ms`);
  console.log('================================');
}

runLoadTest();
