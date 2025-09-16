// Test script for webhook server
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('🧪 Testing Webhook Server\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', health.data);

    // Test 2: Generate test license
    console.log('\n2️⃣ Testing license generation...');
    const license = await axios.post(`${BASE_URL}/api/test/generate-license`, {
      email: 'test@example.com'
    });
    console.log('✅ License generated:', license.data);

    // Test 3: Validate license
    console.log('\n3️⃣ Testing license validation...');
    const validation = await axios.get(`${BASE_URL}/api/validate-license/${license.data.licenseKey}`);
    console.log('✅ License validation:', validation.data);

    // Test 4: Activate license
    console.log('\n4️⃣ Testing license activation...');
    const activation = await axios.post(`${BASE_URL}/api/activate-license`, {
      licenseKey: license.data.licenseKey,
      machineId: 'test-machine-123',
      platform: 'darwin',
      appVersion: '1.0.0'
    });
    console.log('✅ License activation:', activation.data);

    // Test 5: Get statistics
    console.log('\n5️⃣ Testing statistics...');
    const stats = await axios.get(`${BASE_URL}/api/stats`);
    console.log('✅ Statistics:', stats.data);

    // Test 6: Find licenses by email
    console.log('\n6️⃣ Testing license lookup by email...');
    const userLicenses = await axios.get(`${BASE_URL}/api/licenses/test@example.com`);
    console.log('✅ User licenses:', userLicenses.data);

    // Test 7: Send test email
    console.log('\n7️⃣ Testing email service...');
    const emailTest = await axios.post(`${BASE_URL}/api/test/send-email`, {
      email: 'test@example.com',
      type: 'license'
    });
    console.log('✅ Email test:', emailTest.data);

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?data || error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
