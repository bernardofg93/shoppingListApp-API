const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const Purchase = require("../models/Purchase");
require("dotenv").config({ path: "variables.env" });

const createToken = (user, secret, expiresIn) => {
  const { id, name, address, city, country, phone, email } = user;

  return jwt.sign(
    {
      id,
      name,
      address,
      city,
      country,
      phone,
      email,
    },
    secret,
    {
      expiresIn,
    }
  );
};

// Resolver
const resolvers = {
  Query: {
    getUser: async (_, {token}, ctx) => {
      const usuarioId = await jwt.verify(token, process.env.SECRET);
      return usuarioId;
    },
    getUserId: async (_, {id}, ctx) => {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("Producto no encontrado");
      }
      return user;
    },
    getProducts: async () => {
      try {
        const products = await Product.find({});
        return products;
      } catch (error) {
        console.log(error);
      }
    },
    getProduct: async (_, { id }) => {
      // revisar si el producto existe
      const product = await Product.findById({_id: id});

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      return product;
    },
    getPurchaseUser: async (_, { id }, ctx) => {
      try {
        const purchases = await Purchase.find({ user: id }).populate("user");
        console.log(purchases);
        return purchases;
      } catch (error) {
        console.log(error);
      }
    },
  },
  Mutation: {
    newUser: async (_, { input }) => {
      const { email, password } = input;
      // find if user exist into db
      const userExist = await User.findOne({ email });
      if (userExist) {
        throw new Error("El usuario ya esta registrado");
      }
      //Hashear  password
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);

      // save db
      try {
        const user = new User(input);
        user.save();
        return user;
      } catch (error) {
        console.log(error);
      }
    },
    authenticateUser: async (_, { input }) => {
      const { email, password } = input;

      // find if user exist into db
      const userExist = await User.findOne({ email });
      if (!userExist) {
        throw new Error("El usuario No existe");
      }

      const passwordVerify = await bcryptjs.compare(
        password,
        userExist.password
      );
      if (!passwordVerify) {
        throw new Error("El password es Incorrecto");
      }

      // crear el token
      return {
        token: createToken(userExist, process.env.SECRET, "24h"),
      };
    },
    updateUser: async (_, { id, input }) => {
      // find user into db
      let user = await User.findById(id);

      if (!user) {
        throw new Error("usuario no encontrado");
      }

      // save db
      user = await User.findOneAndUpdate({ _id: id }, input, { new: true });
      return user;
    },
    newProduct: async (_, { input }) => {
      try {
        const product = new Product(input);

        // Almacenar en bd
        const res = await product.save();

        return res;
      } catch (error) {
        console.log(error);
      }
    },
    updateProduct: async (_, { id, input }) => {
      let product = await Product.findById(id);

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      // guardar en la bd
      product = await Product.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return product;
    },
    deleteProduct: async (_, { id }) => {
      let product = await Product.findById(id);

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      // Eliminar
      await Product.findOneAndDelete({ _id: id });

      return "Producto Eliminado";
    },
    newPurchase: async (_, { input }, ctx) => {
      console.log(input);
      try {
        // create new purchase
        const newPurchase = new Purchase(input);

        const res = await newPurchase.save();
        console.log(res);
        return res;
      } catch (error) {
        console.log(error);
      }
    },
    updateAvatar: async (_, {file}, ctx) => {
      console.log(file);
      return null;
    }
  },
};

module.exports = resolvers;
