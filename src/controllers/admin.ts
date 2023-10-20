import { RequestHandler } from 'express';
import Joi from 'joi';
import JWT from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { escapeHtml } from '@hapi/hoek';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { arvanS3 } from '../util/arvan-s3.js';
import { Admin, Category, Entity, Field, Product } from '../models/models.js';
import { randomNameGenerator } from '../util/name-generator.js';

export const login: RequestHandler = async (req, res) => {
  try {
    // * Validation
    const validationSchema = Joi.object().keys({
      email: Joi.string().required().email().trim().lowercase().min(8).max(128),
      password: Joi.string().required().trim().min(8).max(128),
    });
    const { value: validatedBody, error: validationError } =
      validationSchema.validate({
        ...req.body,
      });

    // * Validation Error
    if (validationError) return res.status(400).json(validationError);

    // * Try to find user
    const adminExist = await Admin.findOne()
      .where(Field.email)
      .equals(validatedBody.email);

    // * User Not Found Error
    if (!adminExist)
      return res
        .status(404)
        .json({ error: 'Username or password is incorrect.' });

    // * Password Validation
    const matchedPassword = await bcrypt.compare(
      validatedBody.password,
      adminExist.password
    );

    // * Incorrect Password Error
    if (!matchedPassword)
      return res
        .status(404)
        .json({ error: 'Username or password is incorrect.' });

    // * Create JWT token for Authenticated user
    const PAYLOAD = {
      _id: adminExist._id,
      email: adminExist.email,
    };
    const SECRET_KEY = process.env.ADMIN_SECRET_JWT_KEY!;
    const OPTIONS = { expiresIn: process.env.EXPIRE_JWT };
    const token = JWT.sign(PAYLOAD, SECRET_KEY, OPTIONS);

    res.status(200).json({ token: token });
  } catch (error) {
    res.status(500).json();
  }
};
export const changePassword: RequestHandler = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // * Validation
    const validationSchema = Joi.object().keys({
      newPassword: Joi.string().required().trim().min(8).max(128),
      confirmNewPassword: Joi.string().required().trim().min(8).max(128),
    });
    const { value: validatedBody, error: validationError } =
      validationSchema.validate({
        newPassword,
        confirmNewPassword,
      });

    // * Validation Error
    if (validationError) return res.status(400).json(validationError);

    // * Check if the new password is the same and confirm the new password
    if (newPassword !== confirmNewPassword)
      return res
        .status(400)
        .json({ error: 'New password and confirm password does not match.' });

    // * Finding Admin
    const user = await Admin.findOne({ _id: req.admin._id });
    if (!user) return res.status(404).json();

    // * Checking password correctness
    const matchedPassword = await bcrypt.compare(oldPassword, user.password);
    if (!matchedPassword)
      return res.status(400).json({ error: 'Your password is incorrect.' });

    // * Encrypt Password
    const encryptedPassword = await bcrypt.hash(validatedBody.newPassword, 12);

    // * Update Password
    await Admin.updateOne({}, { $set: { password: encryptedPassword } })
      .where(Field._id)
      .equals(req.admin._id);

    res.status(200).json();
  } catch (error) {
    res.status(500).json();
  }
};
export const createCategory: RequestHandler = async (req, res) => {
  try {
    const { categoryName } = req.body;

    // * Validation
    const validationSchema = Joi.object().keys({
      categoryName: Joi.string().required().trim().min(3).max(64).lowercase(),
    });
    const { value: validatedBody, error: validationError } =
      validationSchema.validate({
        categoryName,
      });

    // * Validation Error
    if (validationError) return res.status(400).json(validationError);

    // * Create Category
    try {
      await Category.create({ name: validatedBody.categoryName });
    } catch (error: any) {
      if (error.code === 11000)
        return res.status(400).json({ error: 'Category exist!' });
    }

    res.status(201).json();
  } catch (error) {
    res.status(500).json();
  }
};
export const createEntity: RequestHandler = async (req, res) => {
  try {
    // * Validation
    const validationSchema = Joi.object().keys({
      productId: Joi.string().required().trim(),
      color: Joi.string().min(3).max(32).required().trim(),
      stock: Joi.number().required(),
      price: Joi.number().required(),
    });
    const { value: validatedBody, error: validationError } =
      validationSchema.validate({
        ...req.body,
      });

    // * Validation Error
    if (validationError) return res.status(400).json(validationError);

    // * Product not found
    const product = await Product.findById(validatedBody.productId);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const entity = await Entity.create({
      color: validatedBody.color,
      price: validatedBody.price,
      stock: validatedBody.stock,
      productId: validatedBody.productId,
    });

    res.status(201).json(entity);
  } catch (error) {
    res.status(500).json();
  }
};
export const createProduct: RequestHandler = async (req, res) => {
  try {
    const { slug, category, title, OS, Chipset, CPU, GPU } = req.body;
    // * Handling Insert Product Information

    // * Validation
    const validationSchema = Joi.object().keys({
      slug: Joi.string()
        .required()
        .trim()
        .min(3)
        .max(128)
        .lowercase()
        .custom(value => escapeHtml(value))
        .pattern(new RegExp('^[a-z0-9]+(?:-[a-z0-9]+)*$'))
        .message('just a-z, 0-9,- character allow. '),
      category: Joi.string()
        .required()
        .trim()
        .min(3)
        .max(64)
        .lowercase()
        .custom(value => escapeHtml(value)),
      title: Joi.string()
        .required()
        .trim()
        .min(3)
        .max(64)
        .custom(value => escapeHtml(value)),
      OS: Joi.string()
        .required()
        .trim()
        .min(3)
        .max(64)
        .custom(value => escapeHtml(value)),
      Chipset: Joi.string()
        .required()
        .trim()
        .min(3)
        .max(64)
        .custom(value => escapeHtml(value)),
      CPU: Joi.string()
        .required()
        .trim()
        .min(3)
        .max(64)
        .custom(value => escapeHtml(value)),
      GPU: Joi.string()
        .required()
        .trim()
        .min(3)
        .max(64)
        .custom(value => escapeHtml(value)),
    });
    const { value: validatedBody, error: validationError } =
      validationSchema.validate({
        slug,
        category,
        title,
        OS,
        Chipset,
        CPU,
        GPU,
      });

    // * Validation Error
    if (validationError) return res.status(400).json(validationError);

    // * Category doesn't exist error
    const existCategory = await Category.find()
      .where(Field.name)
      .equals(validatedBody.category);
    if (existCategory.length === 0)
      return res.status(404).json({ error: 'Category does not exist' });

    // * Handling Product Image Upload

    // * Save images name in this const and use it in create operation
    const productImagesPaths: string[] = [];
    const productImages: any = req.files;

    // * Error Handling
    if (productImages.length === 0)
      return res.status(400).json({ error: 'Send at least 1 image' });
    if (productImages.length > 3)
      return res.status(400).json({ error: 'Send maximum 3 images' });

    const arvanS3Promises = [];
    // * Upload multiple files
    for (const productImage of productImages) {
      const productSizeInMB = productImage.size / 1024 / 1024;

      if (productSizeInMB > 0.2) {
        res.status(400).json({ error: 'Maximum file size is 200kb' });
        break;
      }
      // * example: name.jpg => jpg
      const imageExtension = productImage.originalname.split('.').at(-1);
      
      // * S3 Options
      const uploadParams = {
        Bucket: process.env.BUCKET_NAME, // * bucket name
        Key: randomNameGenerator(imageExtension), // * the name of the selected file
        ACL: 'public-read', // * 'private' | 'public-read'
        Body: productImage.buffer,
      };
      productImagesPaths.push(process.env.BUCKET_ADDRESS + uploadParams.Key);

      arvanS3Promises.push(arvanS3.send(new PutObjectCommand(uploadParams)));
    }

    try {
      await Promise.all(arvanS3Promises);
    } catch (err) {
      throw new Error();
    }

    // * Insert Product Information
    try {
      const product = await Product.create({
        slug: validatedBody.slug,
        category: validatedBody.category,
        title: validatedBody.title,
        specification: {
          OS: validatedBody.OS,
          Chipset: validatedBody.Chipset,
          CPU: validatedBody.CPU,
          GPU: validatedBody.GPU,
        },
        images: productImagesPaths,
      });
      res.status(201).json(product);
    } catch (error: any) {
      if (error.code === 11000)
        return res.status(400).json({ error: 'Duplicate slug' });
    }
  } catch (error) {
    res.status(500).json();
  }
};
