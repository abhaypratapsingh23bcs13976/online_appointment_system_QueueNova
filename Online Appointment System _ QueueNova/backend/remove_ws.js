const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// remove const WebSocket = require('ws');
code = code.replace(/const\s+WebSocket\s*=\s*require\('ws'\);/g, '');

// remove everything from // --- WebSocket Server --- to the end of the file except exports
const start = code.indexOf('// --- WebSocket Server ---');
if (start !== -1) {
    const end = code.indexOf('// --- Serverless Export ---');
    if (end !== -1) {
        code = code.substring(0, start) + code.substring(end);
    }
}

fs.writeFileSync('server.js', code);
