import { RequestHandler } from 'express';
import Joi from 'joi';
import JWT from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Admin } from '../models/models.js';
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
    const adminExist = await Admin.findOne({
      email: validatedBody.email,
    });

    // ? User Not Found Error
    if (!adminExist) return res.status(404).json({ error: 'Username or password is incorrect.' });

    // ? Password Validation
    const matchedPassword = await bcrypt.compare(validatedBody.password, adminExist.password);

    // ? Incorrect Password Error
    if (!matchedPassword) return res.status(404).json({ error: 'Username or password is incorrect.' });

    // ? Create JWT token for Authenticated user
    const PAYLOAD = {
      _id: adminExist._id,
      email: adminExist.email,
    };
    const SECRET_KEY = process.env.SECRET_JWT_KEY!;
    const OPTIONS = { expiresIn: process.env.EXPIRE_JWT };
    const token = JWT.sign(PAYLOAD, SECRET_KEY, OPTIONS);

    return res.status(200).json({ token: token });
  } catch (error) {
    res.status(500).json();
  }
};
