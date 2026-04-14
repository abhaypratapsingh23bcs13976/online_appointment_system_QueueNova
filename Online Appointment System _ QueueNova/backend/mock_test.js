const { handler } = require('./index');

const mockEvent = {
  version: '2.0',
  routeKey: 'POST /api/auth/signup',
  rawPath: '/api/auth/signup',
  rawQueryString: '',
  headers: {
    'content-type': 'application/json',
    'origin': 'http://localhost:5173'
  },
  requestContext: {
    http: {
      method: 'POST',
      path: '/api/auth/signup',
      protocol: 'HTTP/1.1'
    }
  },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  }),
  isBase64Encoded: false
};

async function runTest() {
  console.log('Testing Signup Handler...');
  try {
    const response = await handler(mockEvent, {});
    console.log('Response Status:', response.statusCode);
    console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response Body:', response.body);
    
    if (response.statusCode === 201 || (response.statusCode === 400 && response.body.includes('Email already exists'))) {
      console.log('✅ Signup handler validation passed!');
    } else {
      console.log('❌ Signup handler validation failed!');
    }
  } catch (err) {
    console.error('Error during test:', err);
  }
}

runTest();
