const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { JWT_SECRET } = require('../utils/config');
const { HTTP_STATUS, AUTH, ERROR_MESSAGES } = require('../utils/constants');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

// POST /signup
const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // No nos fiamos solo del índice único: si aún no está construido
    // (base recién creada, o autoIndex desactivado en producción) el
    // duplicado pasaría sin error. El 11000 queda como red de seguridad.
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ConflictError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const hash = await bcrypt.hash(password, AUTH.SALT_ROUNDS);
    const user = await User.create({ name, email, password: hash });

    // Quitamos el hash antes de responder. Esta desestructuración con "rest"
    // es la razón por la que necesitamos ignoreRestSiblings en ESLint.
    const { password: hashedPassword, ...safeUser } = user.toObject();

    res.status(HTTP_STATUS.CREATED).send(safeUser);
  } catch (err) {
    next(err);
  }
};

// POST /signin
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: AUTH.TOKEN_TTL });

    res.send({ token });
  } catch (err) {
    next(err);
  }
};

// GET /users/me
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .orFail(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));

    res.send(user);
  } catch (err) {
    next(err);
  }
};

// PATCH /users/me
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { returnDocument: 'after', runValidators: true },
    ).orFail(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));

    res.send(user);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateProfile,
};
