import { RequestHandler } from 'express';
import Joi from 'joi';
import { User } from '../models/models.js';
import bcrypt from 'bcrypt';
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

    // ? Finding User
    const user = await User.findOne({ _id: req.user._id });
    if (!user) return res.status(404).json();

    // ? Checking password correctness
    const matchedPassword = await bcrypt.compare(oldPassword, user.password);
    if (!matchedPassword) return res.status(400).json({ error: 'Your password is incorrect.' });

    // ? Encrypt Password
    const encryptedPassword = await bcrypt.hash(validatedBody.newPassword, 12);

    // ? Update Password
    await User.updateOne({}, { $set: { password: encryptedPassword } })
      .where('_id')
      .equals(req.user._id);

    res.status(200).json();
  } catch (error) {
    res.status(500).json();
  }
};
