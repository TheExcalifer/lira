import { RequestHandler } from 'express';
import Joi from 'joi';
import { escapeHtml } from '@hapi/hoek';
import JWT from 'jsonwebtoken';
// import { escapeHtml } from '@hapi/hoek';
import bcrypt from 'bcrypt';
import { User } from '../models/models.js';

export const login: RequestHandler = async (req, res) => {
  try {
    // ? Validation
    const validationSchema = Joi.object().keys({
      email: Joi.string().required().email().trim().lowercase().min(8).max(128),
      password: Joi.string().required().trim().min(8).max(128),
    });
    const { value: validatedBody, error: validationError } = validationSchema.validate({
      ...req.body,
    });

    // ? Validation Error
    if (validationError) return res.status(400).json(validationError);

    // ? Try to find user
    const userExist = await User.findOne({
      email: validatedBody.email,
    });

    // ? User Not Found Error
    if (!userExist) return res.status(404).json({ error: 'Username or password is incorrect.' });

    // ? Password Validation
    const matchedPassword = await bcrypt.compare(validatedBody.password, userExist.password);

    // ? Incorrect Password Error
    if (!matchedPassword) return res.status(404).json({ error: 'Username or password is incorrect.' });

    // ? Create JWT token for Authenticated user
    const PAYLOAD = {
      _id: userExist._id,
      email: userExist.email,
    };
    const SECRET_KEY = process.env.SECRET_JWT_KEY!;
    const OPTIONS = { expiresIn: process.env.EXPIRE_JWT };
    const token = JWT.sign(PAYLOAD, SECRET_KEY, OPTIONS);

    return res.status(200).json({ token: token });
  } catch (error) {
    res.status(500).json();
  }
};
export const signup: RequestHandler = async (req, res) => {
  try {
    // ? Validation
    const validationSchema = Joi.object().keys({
      name: Joi.string()
        .required()
        .trim()
        .min(3)
        .max(64)
        .custom(name => escapeHtml(name)),
      email: Joi.string().required().email().trim().lowercase().min(8).max(128),
      password: Joi.string().required().trim().min(8).max(128),
    });
    const { value: validatedBody, error: validationError } = validationSchema.validate({
      ...req.body,
    });

    // ? Validation Error
    if (validationError) return res.status(400).json(validationError);

    // ? Duplicate User Error
    const userExist = await User.findOne({
      email: validatedBody.email,
    });
    if (userExist)
      return res.status(400).json({
        error: 'Email already exists. Please choose a different email.',
      });

    // ? Encrypt Password
    const encryptedPassword = await bcrypt.hash(validatedBody.password, 12);

    // ? Create User
    const createdUser = await User.create({
      ...validatedBody,
      password: encryptedPassword,
    });

    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).send();
  }
};
