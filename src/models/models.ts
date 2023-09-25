import mongoose, { Schema, Types } from 'mongoose';

// ? Product
const productSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  category: {
    type: String,
    required: true,
  },
  title: { type: String, required: true },
  images: [String],
  comment: [
    {
      name: { type: String, required: true },
      comment: { type: String, required: true },
    },
  ],
  entityId: [{ type: Types.ObjectId, ref: 'Entity' }],
  specification: {
    OS: { type: String, required: true },
    Chipset: { type: String, required: true },
    CPU: { type: String, required: true },
    GPU: { type: String, required: true },
  },
});

export const Product = mongoose.model('Product', productSchema);

// ? User
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cartId: [{ type: Types.ObjectId, required: true, ref: 'Cart' }],
});

export const User = mongoose.model('User', userSchema);

// ? Cart
const cartSchema = new Schema({
  quantity: { type: Number, required: true },
  entityId: { type: Types.ObjectId, required: true, ref: 'Entity' },
  productId: { type: Types.ObjectId, required: true, ref: 'Product' },
});

export const Cart = mongoose.model('Cart', cartSchema);

// ? Entity
const entitySchema = new Schema({
  color: { type: String, required: true },
  stock: { type: Number, required: true },
  price: { type: Types.Decimal128, required: true },
});

export const Entity = mongoose.model('Entity', entitySchema);

// ? Category
const categorySchema = new Schema({
  name: { type: String, required: true },
});

export const Category = mongoose.model('Category', categorySchema);