import mongoose, { Schema, Types } from 'mongoose';
export enum Field {
  // ? Product
  slug = 'slug',
  title = 'title',
  category = 'category',
  images = 'images',
  comment = 'comment',
  specification = 'specification',

  // ? Entity
  color = 'color',
  stock = 'stock',
  price = 'price',
  productId = 'productId',
  // ? Category
  name = 'name',

  // ? Cart
  quantity = 'quantity',
  entityId = 'entityId',
  userId = 'userId',

  // ? User
  // name = 'name', // ? duplicate
  email = 'email',
  password = 'password',

  // ? Admin
  // name= 'name' // ? duplicate
  // email = 'email',
  // password = 'password',
}
// ? Product
const productSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: {
    type: String,
    required: true,
  },
  images: [String],
  comment: [
    {
      name: { type: String, required: true },
      comment: { type: String, required: true },
    },
  ],
  specification: {
    OS: { type: String, required: true },
    Chipset: { type: String, required: true },
    CPU: { type: String, required: true },
    GPU: { type: String, required: true },
  },
});
export const Product = mongoose.model('Product', productSchema);

// ? Entity
const entitySchema = new Schema({
  color: { type: String, required: true },
  stock: { type: Number, required: true },
  price: { type: Types.Decimal128, required: true },
  productId: { type: Types.ObjectId, required: true, ref: 'Product' },
});
export const Entity = mongoose.model('Entity', entitySchema);

// ? Category
const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
});
export const Category = mongoose.model('Category', categorySchema);

// ? Cart
const cartSchema = new Schema({
  quantity: { type: Number, required: true },
  entityId: { type: Types.ObjectId, required: true, ref: 'Entity' },
  userId: { type: Types.ObjectId, required: true, ref: 'User' },
});
export const Cart = mongoose.model('Cart', cartSchema);

// ? User
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
export const User = mongoose.model('User', userSchema);

// ? Admin
const adminSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
export const Admin = mongoose.model('Admin', adminSchema);
