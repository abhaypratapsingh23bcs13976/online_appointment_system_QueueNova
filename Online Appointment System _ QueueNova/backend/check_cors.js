const fs = require('fs');

fetch('https://lxnembp2jf.execute-api.us-east-1.amazonaws.com/api/auth/signup', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:5173',
    'Access-Control-Request-Method': 'POST'
  }
}).then(async r => {
  const text = await r.text();
  fs.writeFileSync('cors_result3.txt', r.status + '\\n' + JSON.stringify(Object.fromEntries(r.headers.entries())) + '\\n' + text);
}).catch(e => {
  fs.writeFileSync('cors_result3.txt', 'Error: ' + e.message);
});
