const User = require('../models/userModel');
const Product = require('../models/productModel');
const Client = require('../models/clientModel');
const Order = require('../models/orderModel');
const keys = require('../config/keys');
const jwt = require('jsonwebtoken');

const signToken = (user) =>
  jwt.sign({ id: user._id }, keys.jwtSecret, { expiresIn: keys.jwtExpiresIn });

//Resolvers
const resolvers = {
  Query: {
    getUser: async (_, arg, ctx) => await User.findById(ctx.user.id),
    getProducts: async () => {
      try {
        return await Product.find({});
      } catch (err) {
        console.log(err);
      }
    },
    getProductById: async (_, { id }) => {
      try {
        const product = await Product.findById(id);

        return product;
      } catch (err) {
        return new Error('Product not Found');
      }
    },
    getClients: async () => {
      try {
        return await Client.find({});
      } catch (err) {
        console.log(err);
      }
    },
    getClientsBySeller: async (_, arg, ctx) => {
      try {
        const client = await Client.find({ seller: ctx.user.id.toString() });
        return client;
      } catch (err) {
        console.log(err.message);
      }
    },
    getClientById: async (_, { id }, ctx) => {
      const client = await Client.findById(id);
      if (!client) throw new Error('Client do not exist');
      if (client.seller.toString() !== ctx.user.id)
        throw new Error('You dont have credentials');

      return client;
    },
    getOrders: async () =>
      (await Order.find({}).populate('client')) ||
      new Error('There are no orders'),
    getOrdersSeller: async (_, arg, ctx) =>
      (await Order.find({ seller: ctx.user.id })) ||
      new Error('There are no orders for this seller'),
    getOrderById: async (_, { id }, ctx) => {
      const order = await Order.findById(id);

      if (!order) return new Error('There are no orders for this seller');
      if (order.seller.toString() !== ctx.user.id)
        return new Error('You dont have credentials');

      return order;
    },
    getOrderByStatus: async (_, { status }, ctx) =>
      (await Order.find({ seller: ctx.user.id, status })) ||
      new Error('There are no orders for this seller'),
    bestClients: async () => {
      return await Order.aggregate([
        { $match: { status: 'Succesfully' } },
        {
          $group: {
            _id: '$client',
            total: { $sum: '$total' },
          },
        },
        {
          $lookup: {
            from: 'clients',
            localField: '_id',
            foreignField: '_id',
            as: 'client',
          },
        },
        {
          $limit: 10,
        },
        {
          $sort: { total: -1 },
        },
      ]);
    },
    bestSellers: async () => {
      return await Order.aggregate([
        { $match: { status: 'Succesfully' } },
        {
          $group: {
            _id: '$seller',
            total: { $sum: '$total' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'seller',
          },
        },
        {
          $limit: 3,
        },
        {
          $sort: { total: -1 },
        },
      ]);
    },
    searchProduct: async (_, { text }) => {
      return await Product.find({ $text: { $search: text } }).limit(10);
    },
  },
  Mutation: {
    newUser: async (_, { input }) => {
      const { name, lastName, email, password } = input;
      const userExist = await User.findOne({ email });
      if (userExist) throw new Error('El usuario ya esta registrado');

      try {
        const user = await User.create({
          name,
          lastName,
          email,
          password,
        });

        return user;
      } catch (err) {
        console.log(err);
      }
    },
    authUser: async (_, { input }) => {
      const { email, password } = input;
      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await user.correctPassword(password, user.password)))
        throw new Error('Incorrect email or password');

      return {
        token: signToken(user),
      };
    },
    newProduct: async (_, { input }) => {
      try {
        const product = await Product.create(input);
        return product;
      } catch (err) {
        console.log(err);
      }
    },
    updateProduct: async (_, { id, input }) => {
      try {
        const product = await Product.findByIdAndUpdate(id, input, {
          new: true,
        });

        return product;
      } catch (err) {
        return new Error('Product not Found');
      }
    },
    deleteProduct: async (_, { id }) => {
      try {
        await Product.findByIdAndDelete(id);

        return 'Deleted';
      } catch (err) {
        return new Error('Product not Found');
      }
    },
    newClient: async (_, { input }, ctx) => {
      const { email } = input;
      const { user } = ctx;
      const client = await Client.findOne({ email });
      if (client) return new Error('Client alredy exist!');

      return await Client.create({
        ...input,
        seller: user.id,
      });
    },
    updateClient: async (_, { id, input }, ctx) => {
      const client = await Client.findById(id);
      if (!client) return new Error('Client does not exist');
      if (client.seller.toString() !== ctx.user.id)
        return new Error('You dont have credentials');

      return await Client.findByIdAndUpdate(id, input, {
        new: true,
      });
    },
    deleteClient: async (_, { id }, ctx) => {
      const client = await Client.findById(id);
      if (!client) return new Error('Client does not exist');
      if (client.seller.toString() !== ctx.user.id)
        return new Error('You dont have credentials');
      await Client.findByIdAndDelete(id);
      return 'Client Deleted';
    },
    newOrder: async (_, { input }, ctx) => {
      const { client, order } = input;

      let currentClient = await Client.findById(client);

      if (!currentClient) return new Error('Client does not exist');

      if (currentClient.seller.toString() !== ctx.user.id)
        return new Error('You dont have credentials');
      for await (const prod of order) {
        const { id } = prod;
        const product = await Product.findById(id);
        if (prod.quantity > product.quantity)
          return new Error(`${product.name} execeed the quantity on the store`);
        else {
          await Product.findByIdAndUpdate(
            product.id,
            { $inc: { quantity: -prod.quantity } },
            { new: true }
          );
        }
      }

      return await Order.create({
        ...input,
        seller: ctx.user.id,
      });
    },
    updateOrder: async (_, { id, input }, ctx) => {
      const { client, order } = input;

      const currentOrder = await Order.findById(id);
      if (!currentOrder) return new Error('Order does not exist');

      const clientExist = await Client.findById(client);

      if (!clientExist) return new Error('Client does not exist');
      if (clientExist.seller.toString() !== ctx.user.id)
        return new Error('You dont have credentials');

      if (order) {
        for await (const prod of order) {
          const { id } = prod;
          const product = await Product.findById(id);

          const amountProd = currentOrder.order.filter(
            (prod) => prod.id === id
          )[0];
          const total = amountProd.quantity + product.quantity;
          if (prod.quantity > total)
            return new Error(
              `${product.name} execeed the quantity on the store`
            );
          else {
            await Product.findByIdAndUpdate(
              product.id,
              { quantity: total - prod.quantity },
              { new: true }
            );
          }
        }
      }
      return await Order.findByIdAndUpdate(id, input, { new: true });
    },
    deleteOrder: async (_, { id }, ctx) => {
      const order = await Order.findById(id);
      if (!order) return new Error('Client does not exist');
      if (order.seller.toString() !== ctx.user.id)
        return new Error('You dont have credentials');
      await Order.findByIdAndDelete(id);
      return 'Client Deleted';
    },
  },
};

module.exports = resolvers;
