import { RequestHandler } from 'express';
import Joi from 'joi';
import JWT from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Admin, Category } from '../models/models.js';
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
    const SECRET_KEY = process.env.ADMIN_SECRET_JWT_KEY!;
    const OPTIONS = { expiresIn: process.env.EXPIRE_JWT };
    const token = JWT.sign(PAYLOAD, SECRET_KEY, OPTIONS);

    return res.status(200).json({ token: token });
  } catch (error) {
    res.status(500).json();
  }
};
export const changePassword: RequestHandler = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // ? Validation
    const validationSchema = Joi.object().keys({
      newPassword: Joi.string().required().trim().min(8).max(128),
      confirmNewPassword: Joi.string().required().trim().min(8).max(128),
    });
    const { value: validatedBody, error: validationError } = validationSchema.validate({
      newPassword,
      confirmNewPassword,
    });

    // ? Validation Error
    if (validationError) return res.status(400).json(validationError);

    // ? Check if the new password is the same and confirm the new password
    if (newPassword !== confirmNewPassword)
      return res.status(400).json({ error: 'New password and confirm password does not match.' });

    // ? Finding Admin
    const user = await Admin.findOne({ _id: req.admin._id });
    if (!user) return res.status(404).json();

    // ? Checking password correctness
    const matchedPassword = await bcrypt.compare(oldPassword, user.password);
    if (!matchedPassword) return res.status(400).json({ error: 'Your password is incorrect.' });

    // ? Encrypt Password
    const encryptedPassword = await bcrypt.hash(validatedBody.newPassword, 12);

    // ? Update Password
    await Admin.updateOne({ _id: req.admin._id }, { $set: { password: encryptedPassword } });

    res.status(200).json();
  } catch (error) {
    res.status(500).json();
  }
};
export const createCategory: RequestHandler = async (req, res) => {
  try {
    const { categoryName } = req.body;

    // ? Validation
    const validationSchema = Joi.object().keys({
      categoryName: Joi.string().required().trim().min(3).max(64),
    });
    const { value: validatedBody, error: validationError } = validationSchema.validate({
      categoryName,
    });

    // ? Validation Error
    if (validationError) return res.status(400).json(validationError);

    // ? Create Category
    try {
      await Category.create({ name: validatedBody.categoryName });
    } catch (error: any) {
      if (error.code === 11000) return res.status(400).json({ error: 'Category exist!' });
    }

    res.status(201).json();
  } catch (error) {
    res.status(500).json();
  }
};
