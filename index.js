const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const express = require("express");
const resolvers = require("./db/resolvers");
const typeDefs = require("./db/schema");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });
const { graphqlUploadExpress } = require("graphql-upload");

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
  const serverApollo = new ApolloServer(
    {
      typeDefs,
      resolvers,
      context: ({ req }) => {
        const token = req.headers["authorization"] || "";
        if (token) {
          try {
            const user = jwt.verify(
              token.replace("Bearer ", ""),
              process.env.SECRET
            );

            console.log("index-user",user);

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
    }
  );
  await serverApollo.start();

  const app = express();
  app.use("/graphql",graphqlUploadExpress());
  serverApollo.applyMiddleware({app});
  await new Promise((r) => app.listen({ port: process.env.PORT || 4000 }, r));

  console.log(`Servidor listo en la URL ${serverApollo.graphqlPath}`);
}
