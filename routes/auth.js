const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");
const user = require("../models/User");

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, username, role } = req.body;
    if (!(email && password && firstName && lastName && username)) {
      res.status(400).send("All input is required");
    }
    const user = await User.findOne({ email });
    console.log("user", user);
    if (user) {
      return res.status(409).json({ error: "User Already Registered" });
    } else {
      var encryptedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        firstName,
        lastName,
        username,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
        role,
      });
    }
    res.status(201).json({ message: "User registered successfully " });
  } catch (error) {
    console.log(user);
    res.send("something went wrong");
  }
});

router.post("/signIn", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    const user = await User.findOne({ email }).lean();
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user._id, email }, "your_secret_key", {
        expiresIn: "1h",
      });
      user.token = token;
      res.status(200).json(user);
    } else {
      res.status(400).send("Invalid Credentials");
    }
  } catch (error) {
    res.send("error");
  }
});

module.exports = router;
