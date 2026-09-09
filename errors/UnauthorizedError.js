const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

class UnauthorizedError extends Error {
  constructor(message = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = HTTP_STATUS.UNAUTHORIZED;
  }
}

module.exports = UnauthorizedError;
