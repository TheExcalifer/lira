### Proejct Features

- Lira
  - Singup
  - Login
  - Product
  - Product Filter
  - Categories
- Admin
  - Login
  - Change Password
  - Create Category
  - Create Product
  - Create Entity
- User
  - Add To Cart
  - Change Password
  - Cart

### Used Techonologies

- [Node.js](https://nodejs.org/en)
- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://mongodb.com)
- [Mongoose](https://mongoosejs.com/)
- [Joi](https://joi.dev/)
- [SWC](https://swc.rs/)
- [JWT](https://jwt.io/)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [Client-s3](https://www.npmjs.com/package/@aws-sdk/client-s3)
- [Multer](https://www.npmjs.com/package/multer)

## Docker

### Developement

1. `sudo docker run --name lira-db -p 27017:27017 -v [/home/username/mongodb]:/data/db mongo:7.0-rc-jammy`
2. Set `CONNECTION_STRING="mongodb://localhost:27017/lira"` in _.env_
3. `npm run dev:compile`
4. `npm run dev:serve`

### Deploy

1. Set `CONNECTION_STRING="mongodb://mongodb:27017/lira"` in _.env_
2. `sudo docker compose up --build`

## Admin Credential

Create a document in admin collection with these information.

- **name**: lira
- **email**: lira@lira.com
- **password**: $2b$12$Bq10g3BJVWpkZhgYtYxsbeE7Dtkvyp2RvBJ.Z.I0DBYEIr1/IWjhq

Now you can use lira@lira.com for email & password to login as an admin.
