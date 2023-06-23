const mongoose = require("mongoose");

const User = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "end-user"],
    default: "end-user",
  },
});

module.exports = mongoose.model("User", User);
