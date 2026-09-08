const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

class ConflictError extends Error {
  constructor(message = ERROR_MESSAGES.CONFLICT) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = HTTP_STATUS.CONFLICT;
  }
}

module.exports = ConflictError;
