import { RequestHandler } from 'express';
import Joi from 'joi';
import { escapeHtml } from '@hapi/hoek';
import JWT from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  User,
  Product,
  Category,
  Cart,
  Entity,
  Field,
} from '../models/models.js';

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
    const userExist = await User.findOne()
      .where(Field.email)
      .equals(validatedBody.email);

    // * User Not Found Error
    if (!userExist)
      return res
        .status(404)
        .json({ error: 'Username or password is incorrect.' });

    // * Password Validation
    const matchedPassword = await bcrypt.compare(
      validatedBody.password,
      userExist.password
    );

    // * Incorrect Password Error
    if (!matchedPassword)
      return res
        .status(404)
        .json({ error: 'Username or password is incorrect.' });

    // * Create JWT token for Authenticated user
    const PAYLOAD = {
      _id: userExist._id,
      email: userExist.email,
    };
    const SECRET_KEY = process.env.SECRET_JWT_KEY!;
    const OPTIONS = { expiresIn: process.env.EXPIRE_JWT };
    const token = JWT.sign(PAYLOAD, SECRET_KEY, OPTIONS);

    res.status(200).json({ token: token });
  } catch (error) {
    res.status(500).json();
  }
};
export const signup: RequestHandler = async (req, res) => {
  try {
    // * Validation
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
    const { value: validatedBody, error: validationError } =
      validationSchema.validate({
        ...req.body,
      });

    // * Validation Error
    if (validationError) return res.status(400).json(validationError);

    // * Duplicate User Error
    const userExist = await User.findOne()
      .where(Field.email)
      .equals(validatedBody.email);
    if (userExist)
      return res.status(400).json({
        error: 'Email already exists. Please choose a different email.',
      });

    // * Encrypt Password
    const encryptedPassword = await bcrypt.hash(validatedBody.password, 12);

    // * Create User
    const createdUser = await User.create({
      ...validatedBody,
      password: encryptedPassword, // overwrite
    });

    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).send();
  }
};
export const getProduct: RequestHandler = async (req, res) => {
  try {
    const { slug } = req.params;

    // * Find Product
    const product = await Product.aggregate().match({ slug }).lookup({
      from: 'entities',
      localField: '_id',
      foreignField: 'productId',
      as: 'entities',
    });

    // * Product Not Found
    if (!product) return res.status(404).json();

    res.status(200).json(product);
  } catch (error) {
    res.status(500).send();
  }
};
export const getCategories: RequestHandler = async (req, res) => {
  try {
    const categories = await Category.find();

    // * Category Not Found
    if (categories.length === 0) return res.status(404).json();

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).send();
  }
};
export const getProductsByFilter: RequestHandler = async (req, res) => {
  try {
    // * Return 12 item per page
    const ITEM_PER_PAGE = 12;

    // * Validation
    const validationSchema = Joi.object().keys({
      page: Joi.number().required(),
      categoryName: Joi.string(),
      minPrice: Joi.number().required(),
      maxPrice: Joi.number().required(),
      sortByPriceAsc: Joi.boolean(),
    });
    const { value: validatedBody, error: validationError } =
      validationSchema.validate({
        ...req.body,
      });

    // * Validation Error
    if (validationError) return res.status(400).json(validationError);

    let productAggregation = Product.aggregate()
      .lookup({
        from: 'entities',
        localField: '_id',
        foreignField: 'productId',
        as: 'entities',
      })
      .match({
        'entities.price': {
          $gte: validatedBody.minPrice,
          $lte: validatedBody.maxPrice,
        },
      });

    if (validatedBody.categoryName) {
      productAggregation.match({ category: validatedBody.categoryName });
    }
    if (validatedBody.sortByPriceAsc) {
      productAggregation.sort({ field: 'asc', 'entities.price': -1 });
    } else if (validatedBody.sortByPriceAsc === false) {
      productAggregation.sort({ field: 'desc', 'entities.price': 1 });
    }

    productAggregation
      .skip(ITEM_PER_PAGE * (validatedBody.page - 1))
      .limit(ITEM_PER_PAGE);

    const products = await productAggregation.exec();

    // * Product Not Found
    if (products.length === 0) return res.status(404).json();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).send();
  }
};
export const addToCart: RequestHandler = async (req, res) => {
  try {
    // * Validation
    const validationSchema = Joi.object().keys({
      entityId: Joi.string().required().trim(),
    });
    const { value: validatedBody, error: validationError } =
      validationSchema.validate({
        ...req.body,
      });

    // * Validation Error
    if (validationError) return res.status(400).json(validationError);

    const entity: any = await Entity.findById(validatedBody.entityId)
      .where(Field.stock)
      .ne(0);
    if (!entity) return res.status(404).json();

    const cart = await Cart.findOne()
      .where(Field.entityId)
      .equals(validatedBody.entityId)
      .where(Field.userId)
      .equals(req.user._id);

    // * Non exist item
    if (!cart) {
      await Cart.create({
        userId: req.user._id,
        entityId: validatedBody.entityId,
        quantity: 1,
      });
      return res.status(201).json();
    }

    // * Unavailable in stock
    if (cart.quantity >= entity.stock)
      return res.status(404).json({ error: 'Product Unavailable.' });

    // * exist item. increase 1 number
    cart.$inc(Field.quantity, 1);
    await cart.save();

    res.status(200).json();
  } catch (error) {
    res.status(500).send();
  }
};
