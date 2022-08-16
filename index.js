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
  cache: 'bounded',
  context: ({ req }) => {

    const token = req.headers["authorization"] || "";

    if (token) {
      // console.log(token);
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
server.listen({ port: 59313 || 4000 }).then(({ url }) => {
  console.log(`Servidor listo en la URL ${url}`);
});

// const app = server.listen(process.env.PORT || 5000, () => {
//   const port = app.address().port;
//   console.log(`Express is working on port ${port}`);
// });
// let port_number = server.listen(process.env.PORT || 4000);
// server.listen(port_number);
