const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

class NotFoundError extends Error {
  constructor(message = ERROR_MESSAGES.NOT_FOUND) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = HTTP_STATUS.NOT_FOUND;
  }
}

module.exports = NotFoundError;
