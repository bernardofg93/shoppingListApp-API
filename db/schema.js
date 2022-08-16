const { gql } = require("apollo-server");
// Schema
const typeDefs = gql`

  scalar Upload

  type User {
    id: ID
    name: String
    address: String
    city: String
    country: String
    phone: String
    email: String
    create: String
  }

  type Product {
    id: ID
    name: String
    description: String
    price: Float
    create: String
  }

  type Token {
    token: String
  }

  type UpdateAvatar {
    status: Boolean
    urlAvatar: String
  }

  type Purchase {
    id: ID
    user: User
    purchase: [PurchaseGroup]!
  }

  type PurchaseGroup {
    id: ID
    name: String
    description: String
    price: Float
  }

  input UserInput {
    name: String!
    address: String!
    city: String!
    country: String!
    phone: String!
    email: String
    password: String
  }

  input AutenticateInput {
    email: String!
    password: String!
  }

  input ProductInput {
    name: String!
    description: String!
    price: Float!
  }

  input PurchaseProductInput {
    id: ID!
    name: String
    description: String
    price: Float
  }

  input PurchaseInput {
    purchase: [PurchaseProductInput]!
    user: ID
  }

  type Query {
    getUser(token: String!): User
    getUserId(id: ID!): User
    getProducts: [Product]
    getProduct(id: ID!): Product

    getPurchaseUser(id: ID!): [Purchase]
  }

  type Mutation {
    #User
    newUser(input: UserInput): User
    authenticateUser(input: AutenticateInput): Token
    updateUser(id: ID!, input: UserInput): User
    updateAvatar(file: Upload!): UpdateAvatar

    #product
    newProduct(input: ProductInput): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String

    #purcharse
    newPurchase(input: PurchaseInput): Purchase
  }
`;

module.exports = typeDefs;
