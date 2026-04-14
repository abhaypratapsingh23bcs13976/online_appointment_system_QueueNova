const fs = require('fs');
const archiver = require('archiver');
const output = fs.createWriteStream('../QueueNovaAPI.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('Archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

archive.glob('**/*', {
  cwd: __dirname,
  ignore: ['.serverless/**', 'deploy.status.txt', 'deploy.js', 'refactor.js', 'error.log']
});

archive.finalize();
