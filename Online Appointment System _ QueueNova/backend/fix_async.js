const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /(app\.(?:get|post|put|delete)\([^,]+(?:,\s*(?:authenticateToken|authorizeAdmin))*\s*,\s*)\((req,\s*res)(,\s*next)?\)\s*=>\s*\{/g;

code = code.replace(regex, (match, p1, p2, p3) => {
    // Double check it doesn't have async already
    if (match.includes('async')) return match;
    return p1 + 'async (' + p2 + (p3 || '') + ') => {';
});

// Also manually fix line 392
code = code.replace(/app\.get\('\/api\/doctors', \(req, res\) => \{/g, "app.get('/api/doctors', async (req, res) => {");

fs.writeFileSync('server.js', code);
