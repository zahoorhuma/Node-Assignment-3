const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;
const Product = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  availableQuantity: {
    type: Number,
    default: 0,
  },
  category: String,
  otherProperties: {
    type: mongoose.Schema.Types.Mixed, // i used this to store object
  },
});

// Create a model
const MyModel = mongoose.model("Product", Product);

// Export the model
module.exports = MyModel;
