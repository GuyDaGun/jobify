import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnAuthenticatedError } from '../errors/index.js';
import attachCookies from '../utils/attachCookies.js';

/******************** REGISTER USER *************************/

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new BadRequestError('please provide all values');
  }

  const userAlreadyExists = await User.findOne({ email });

  if (userAlreadyExists) {
    throw new BadRequestError('Email already in use');
  }

  const user = await User.create({ name, email, password });

  const token = user.createJWT();

  attachCookies({ res, token });

  res.status(StatusCodes.OK).json({
    user: {
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      name: user.name,
    },
    location: user.location,
  });
};

/******************** LOGIN USER *************************/

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('please provide all values');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new UnAuthenticatedError('User not Authorized');
  }

  console.log(user);

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnAuthenticatedError('User not Authorized');
  }

  const token = user.createJWT();
  user.password = undefined;

  attachCookies({ res, token });

  res.status(StatusCodes.OK).json({ user, location: user.location });
};

/******************** UPDATE USER *************************/

const updateUser = async (req, res) => {
  const { email, name, lastName, location } = req.body;

  if (!email || !name || !lastName || !location) {
    throw new BadRequestError('please provide all values');
  }

  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;
  user.lastName = lastName;
  user.location = location;

  await user.save();

  const token = user.createJWT();

  attachCookies({ res, token });

  res.status(StatusCodes.OK).json({ user, location: user.location });
};

/******************** GET CURRENT USER *************************/

const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  res.status(StatusCodes.OK).json({ user, location: user.location });
};

/******************** LOGOUT USER *************************/

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'User Logged Out' });
};

export { register, login, updateUser, getCurrentUser, logout };
