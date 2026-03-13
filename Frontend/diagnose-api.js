import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(path) {
  try {
    console.log(`Testing: ${BASE_URL}${path}`);
    const response = await axios.get(`${BASE_URL}${path}`);
    console.log(`✅ Success (${response.status}): ${path}`);
    return true;
  } catch (error) {
    if (error.response) {
      console.log(`❌ Error (${error.response.status}): ${path} - ${error.response.statusText}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`❌ Connection Refused: Backend is not running on ${BASE_URL}`);
      return false;
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
    return false;
  }
}

async function runDiagnosis() {
  console.log('--- Starting API Diagnosis ---');
  
  // Test root
  await testEndpoint('/');
  
  // Test common prefixes
  await testEndpoint('/api');
  await testEndpoint('/v1');
  
  // Test specific endpoints (assuming GET for simplicity, even if they are POST)
  // Usually POST endpoints return 404 on GET if route exists but method is wrong, 
  // or 405 Method Not Allowed. If route doesn't exist, it's 404.
  // Let's try to infer based on common patterns.
  
  console.log('\n--- Checking Auth Routes ---');
  try {
      await axios.post(`${BASE_URL}/auth/login`, {});
      console.log('✅ POST /auth/login: Route exists (got response)');
  } catch (e) {
      if (e.response && e.response.status === 404) {
          console.log('❌ POST /auth/login: 404 Not Found (Route likely incorrect)');
      } else {
          console.log(`ℹ️ POST /auth/login: ${e.response ? e.response.status : e.message}`);
      }
  }

  try {
      await axios.post(`${BASE_URL}/api/auth/login`, {});
      console.log('✅ POST /api/auth/login: Route exists (got response)');
  } catch (e) {
      if (e.response && e.response.status === 404) {
          console.log('❌ POST /api/auth/login: 404 Not Found');
      } else {
           console.log(`ℹ️ POST /api/auth/login: ${e.response ? e.response.status : e.message}`);
      }
  }

  console.log('\n--- Diagnosis Complete ---');
}

runDiagnosis();
