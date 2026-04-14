const serverless = require('serverless-http');

module.exports.handler = async (event, context) => {
  try {
    // Lazy load the app so we can catch initialization errors
    const app = require('./server');
    const handler = serverless(app);
    return await handler(event, context);
  } catch (err) {
    console.error('BOOTSTRAP_ERROR:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Bootstrap Error',
        message: err.message,
        stack: err.stack,
        path: __filename
      })
    };
  }
};
