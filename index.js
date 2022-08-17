const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const express = require("express");
const resolvers = require("./db/resolvers");
const typeDefs = require("./db/schema");
const jwt = require("jsonwebtoken");
const { graphqlUploadExpress } = require("graphql-upload");
require("dotenv").config({ path: "variables.env" });
const http = require('http');

// Conection to mongo DB
mongoose.connect(process.env.DB_MONGO, { useNewUrlParser: true });
mongoose.connection.once("open", () => {
  console.log("MongoDB Connected");
});
mongoose.connection.on("error", (err) => {
  console.log("MongoDB connection error: ", err);
});

server();

// Server
async function server() {
  const serverApollo = new ApolloServer({
    typeDefs,
    resolvers,
    cache: "bounded",
    context: ({ req }) => {
      const token = req.headers["authorization"] || "";
      if (token) {
        try {
          const user = jwt.verify(
            token.replace("Bearer ", ""),
            process.env.SECRET
          );
          return {
            user,
          };
        } catch (error) {
          console.log("Hubo un error");
          console.log(error);
          throw new Error("token invalido");
        }
      }
    },
  });
  await serverApollo.start();
  const app = express();
  const server = http.Server(app);
  server.use(graphqlUploadExpress());
  serverApollo.applyMiddleware({ server });
  await new Promise((r) => server.listen({ port: process.env.PORT || PORT }, r));

  console.log(`Servidor listo en la URL`);
}
