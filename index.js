const { ApolloServer } = require("apollo-server");
const connectDB = require("./config/db");
const resolvers = require("./db/resolvers");
const typeDefs = require("./db/schema");
require("dotenv").config({ path: "variables.env" });
const jwt = require("jsonwebtoken");

// Conection to mongo DB
connectDB();

// Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {

    const token = req.headers["authorization"] || "";

    if (token) {
      console.log(token);
      try {
        const user = jwt.verify(
          token.replace("Bearer ", ""),
          process.env.SECRET
        );
        // console.log(usuario);
        return {
          user,
        };
      } catch (error) {
        console.log("Hubo un error");
        console.log(error);
      }
    }
  },
});

// Run server
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Servidor listo en la URL ${url}`);
});