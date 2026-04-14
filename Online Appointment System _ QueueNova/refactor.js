const fs = require('fs');
const path = 'c:/Users/Hemant/Downloads/cloud project/antigravity/backend/server.js';
let code = fs.readFileSync(path, 'utf8');

// replace "const db = readDB();" with "const db = await readDB();"
code = code.replace(/const db = readDB\(\);/g, 'const db = await readDB();');
// replace "writeDB(db);" with "await writeDB(db);"
code = code.replace(/writeDB\(db\);/g, 'await writeDB(db);');

// Make express routes async if they are not already
const methods = ['get', 'post', 'put', 'delete'];
methods.forEach(m => {
  const regex = new RegExp(`app\\.${m}\\(([^,]+),\\s*([^,]+)?\\s*,?\\s*([^,]+)?\\s*,?\\s*\\(req,\\s*res\\)\\s*=>\\s*\\{`, 'g');
  code = code.replace(regex, (match, p1, p2, p3) => {
    let res = `app.${m}(${p1}, `;
    if (p2 && !p2.includes('(req, res)')) res += `${p2}, `;
    if (p3 && !p3.includes('(req, res)')) res += `${p3}, `;
    res += `async (req, res) => {`;
    return res;
  });
});

// Some manual fixes for passport
// passport.deserializeUser((id, done) => { ...
code = code.replace(/passport\.deserializeUser\(\(id, done\) => \{/, 'passport.deserializeUser(async (id, done) => {');
// passport callback (accessToken, refreshToken, profile, done) => {
code = code.replace(/\(accessToken, refreshToken, profile, done\) => \{/, 'async (accessToken, refreshToken, profile, done) => {');

// Remove app.listen as we will use serverless
code = code.replace(/app\.listen\([^)]+\);\n?/g, '');
code = code.replace(/console\.log\([^)]+'Backend server running[^)]+\);\n?/g, '');

// Append serverless handler
if (!code.includes('serverless-http')) {
  code += `\n// --- Serverless Export ---\nconst serverless = require('serverless-http');\nmodule.exports.handler = serverless(app);\n`;
}

fs.writeFileSync(path, code);
