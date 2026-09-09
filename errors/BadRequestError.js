const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

class BadRequestError extends Error {
  constructor(message = ERROR_MESSAGES.BAD_REQUEST) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = HTTP_STATUS.BAD_REQUEST;
  }
}

module.exports = BadRequestError;
