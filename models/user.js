const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const { USER_RULES, VALIDATION_MESSAGES, ERROR_MESSAGES } = require('../utils/constants');
const UnauthorizedError = require('../errors/UnauthorizedError');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [USER_RULES.NAME_MIN, VALIDATION_MESSAGES.NAME_MIN],
      maxlength: [USER_RULES.NAME_MAX, VALIDATION_MESSAGES.NAME_MAX],
      default: USER_RULES.DEFAULT_NAME,
    },
    email: {
      type: String,
      required: [true, VALIDATION_MESSAGES.EMAIL_REQUIRED],
      unique: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: VALIDATION_MESSAGES.EMAIL_INVALID,
      },
    },
    password: {
      type: String,
      required: [true, VALIDATION_MESSAGES.PASSWORD_REQUIRED],
      minlength: [USER_RULES.PASSWORD_MIN, VALIDATION_MESSAGES.PASSWORD_MIN],
      // No se devuelve nunca en las consultas salvo que se pida explícitamente
      select: false,
    },
  },
  { versionKey: false },
);

// Método estático: busca al usuario y comprueba la contraseña de una sola vez.
// Devuelve el mismo mensaje en los dos fallos para no revelar qué correos existen.
userSchema.statics.findUserByCredentials = async function findUserByCredentials(email, password) {
  const user = await this.findOne({ email }).select('+password');

  if (!user) {
    throw new UnauthorizedError(ERROR_MESSAGES.WRONG_CREDENTIALS);
  }

  const matched = await bcrypt.compare(password, user.password);

  if (!matched) {
    throw new UnauthorizedError(ERROR_MESSAGES.WRONG_CREDENTIALS);
  }

  return user;
};

module.exports = mongoose.model('user', userSchema);
