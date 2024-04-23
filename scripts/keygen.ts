// scope this so typescript doesn't freak out
(function () {
  const crypto = require('node:crypto');

  const key = crypto.randomBytes(32).toString('base64');

  process.stdout.write(key);
})();
