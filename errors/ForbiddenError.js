const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

class ForbiddenError extends Error {
  constructor(message = ERROR_MESSAGES.FORBIDDEN) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = HTTP_STATUS.FORBIDDEN;
  }
}

module.exports = ForbiddenError;
