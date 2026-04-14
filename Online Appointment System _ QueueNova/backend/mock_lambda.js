const lambda = require('./lambda');
lambda.handler({
  version: '2.0',
  routeKey: 'ANY /{proxy+}',
  rawPath: '/api/auth/signup',
  rawQueryString: '',
  headers: {
    origin: 'http://localhost:5173',
    'access-control-request-method': 'POST'
  },
  requestContext: {
    http: {
      method: 'OPTIONS',
      path: '/api/auth/signup'
    }
  }
}, {}).then(res => {
  const fs = require('fs');
  fs.writeFileSync('lambda_output2.txt', JSON.stringify(res, null, 2));
}).catch(err => {
  const fs = require('fs');
  fs.writeFileSync('lambda_output2.txt', 'ERROR: ' + err.stack);
});
