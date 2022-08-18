const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const express = require("express");
const resolvers = require("./db/resolvers");
const typeDefs = require("./db/schema");
const jwt = require("jsonwebtoken");
const { graphqlUploadExpress } = require("graphql-upload");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config({ path: "variables.env" });

// Conection to mongo DB
mongoose.connect(process.env.DB_MONGO, { useNewUrlParser: true });
mongoose.connection.once("open", () => {
  console.log("MongoDB Connected");
});
mongoose.connection.on("error", (err) => {
  console.log("MongoDB connection error: ", err);
});

server();

const options = {
  target: 'https://expressjs-mongoose-production-d87c.up.railway.app', // target host with the same base path
  changeOrigin: true, // needed for virtual hosted sites
};

const proxy = createProxyMiddleware(options);

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
  app.use(graphqlUploadExpress());
  serverApollo.applyMiddleware({ app });
  await new Promise((r) => app.listen({ port: process.env.PORT || 4000 }, r));

  console.log(`Servidor listo en la URL`);
}
