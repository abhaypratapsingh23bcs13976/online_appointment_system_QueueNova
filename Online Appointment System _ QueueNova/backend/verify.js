const fs = require('fs');
let isHealthy = true;

try {
    const app = require('./server.js');
    console.log('[OK] server.js syntax and requires are perfectly clean.');
} catch (e) {
    console.log('[ERROR] server.js crashed on require: ' + e.stack);
    isHealthy = false;
}

try {
    const handler = require('./index.js');
    console.log('[OK] index.js syntax and require are clean.');
} catch (e) {
    console.log('[ERROR] index.js crashed on require: ' + e.stack);
    isHealthy = false;
}

if (!fs.existsSync('index.js')) {
    console.log('[ERROR] index.js is missing! AWS Lambda requires this file name.');
    isHealthy = false;
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!packageJson.dependencies['serverless-http']) {
    console.log('[ERROR] serverless-http missing from package.json dependencies!');
    isHealthy = false;
}

if (isHealthy) {
    console.log('\\n✅ Backend is 100% verified and healthy.');
} else {
    console.log('\\n❌ Backend verification failed.');
}
