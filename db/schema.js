const { gql } = require('apollo-server');

//Schema
const typeDefs = gql`
  type Query {
    # Users
    getUser: User

    # Products
    getProducts: [Product]
    getProductById(id: ID!): Product

    # Clients
    getClients: [Client]
    getClientsBySeller: [Client]
    getClientById(id: ID!): Client

    # Orders
    getOrders: [Order]
    getOrdersSeller: [Order]
    getOrderById(id: ID!): Order
    getOrderByStatus(status: String!): Order

    #Advanced Searchs
    bestClients: [TopClient]
    bestSellers: [TopSeller]
    searchProduct(text: String!): [Product]
  }

  type Token {
    token: String
  }

  type User {
    id: ID
    name: String
    lastName: String
    email: String
    createdAt: String
  }

  type Product {
    id: ID
    name: String
    quantity: Int
    price: Float
    createdAt: String
  }

  type Client {
    id: ID
    name: String
    lastName: String
    enterprise: String
    email: String
    phone: String
    seller: ID
  }

  type Order {
    id: ID
    order: [OrderGroup]
    total: Float
    client: Client
    seller: ID
    date: String
    status: OrderStatus
  }

  type OrderGroup {
    id: ID
    quantity: Int
    name: String
    price: Float
  }

  type TopClient {
    total: Float
    client: [Client]
  }
  type TopSeller {
    total: Float
    seller: [User]
  }

  input UserInput {
    name: String!
    lastName: String!
    email: String!
    password: String!
  }

  input AuthInput {
    email: String!
    password: String!
  }

  input ProductInput {
    name: String!
    quantity: Int!
    price: Float!
  }

  input ClientInput {
    name: String!
    lastName: String!
    enterprise: String!
    email: String!
    phone: String!
  }

  input OrderProductInput {
    id: ID
    quantity: Int
    name: String
    price: Float
  }

  input OrderInput {
    order: [OrderProductInput]
    total: Float
    client: ID
    status: OrderStatus
  }

  enum OrderStatus {
    Waiting
    Succesfully
    Cancel
  }

  type Mutation {
    # Users
    newUser(input: UserInput): User
    authUser(input: AuthInput): Token

    # Product
    newProduct(input: ProductInput): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String

    # Client
    newClient(input: ClientInput): Client
    updateClient(id: ID!, input: ClientInput): Client
    deleteClient(id: ID!): String

    # Orders
    newOrder(input: OrderInput): Order
    updateOrder(id: ID!, input: OrderInput): Order
    deleteOrder(id: ID!): String
  }
`;

module.exports = typeDefs;
