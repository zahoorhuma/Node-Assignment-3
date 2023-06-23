const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const verifyToken = require("../middleware/verifyToken");

router.post("/:userId/place-order", verifyToken, async (req, res) => {
  const userId = req.params.userId;
  const { shippingAddress } = req.body;
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
        0
      ),
    });
    await order.save();
    // removing the cart products
    cart.products = [];
    await cart.save();
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
