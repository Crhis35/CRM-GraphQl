const { ApolloServer } = require('apollo-server');
const keys = require('./config/keys');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolver');
const jwt = require('jsonwebtoken');

const app = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers['authorization'] || null;
    if (token) {
      try {
        const user = jwt.verify(token.replace('Bearer ', ''), keys.jwtSecret);
        return {
          user,
        };
      } catch (err) {
        console.log('Hubo un error', err.message);
      }
    }
  },
});

module.exports = app;
