/* eslint-disable no-underscore-dangle */
const express = require("express");

const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const transporter = require("../config/gmail");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

router.post("/:userId/place-order", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { shippingAddress } = req.body;
  console.log("---> ", req.body);
  try {
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    // Create a new order based on the cart items
    const order = new Order({
      userId: cart.userId,
      shippingAddress,
      products: cart.products.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
        totalPrice: item.productId.price * item.quantity,
      })),
      totalPrice: cart.products.reduce(
        (total, item) => total + item.productId.price * item.quantity,
        // eslint-disable-next-line comma-dangle
        0
      ),
    });
    await order.save();
    // removing the cart products
    cart.products = [];
    await cart.save();
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get the user's email
    const userEmail = user.email;
    const mailOptions = {
      from: "humazahoor786@gmail.com",
      to: userEmail,
      subject: "Order Confirmation ",
      text: "Your order has been placed successfully!",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Email sent: ", info.response);
      }
    });
    return res.status(201).json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", errorMessage: error });
  }
});

module.exports = router;
