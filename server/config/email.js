// Backwards-compatible entry point: all email logic lives in utils/email.js.
// Re-exporting keeps imports tidy (require('./config/email')).
module.exports = require('../utils/email');
