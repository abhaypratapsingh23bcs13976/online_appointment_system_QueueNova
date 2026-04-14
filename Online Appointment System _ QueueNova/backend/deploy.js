const { execSync } = require('child_process');
const fs = require('fs');

try {
  const output = execSync('node_modules\\\\.bin\\\\serverless.cmd deploy', {
    env: {
      ...process.env,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
    },
    encoding: 'utf8'
  });

  fs.writeFileSync('deploy.status.txt', output);

} catch (e) {
  fs.writeFileSync(
    'deploy.status.txt',
    "ERROR:\n" + e.message + "\n" + e.stdout + "\n" + e.stderr
  );
}