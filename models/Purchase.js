const { mongoose } = require("mongoose");

const ProductSchema = mongoose.Schema({
  purchase: {
    type: Array,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  create: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Purchase", ProductSchema);
