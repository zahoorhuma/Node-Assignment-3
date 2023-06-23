const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const verifyToken = require("../middleware/verifyToken");
const User = require("../models/User");

const checkValidRole = async (user) => {
  const productUser = await User.findOne({ email: user });
  if (user) {
    const userRole = productUser.role;
    console.log("userRole---", userRole);
    // Check the user's role and perform further actions
    if (userRole === "admin") {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

router.get("/all-products", verifyToken, async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/add-product", verifyToken, async (req, res) => {
  console.log("---->", req.user);
  const {
    title,
    description,
    price,
    availableQuantity,
    category,
    otherProperties,
  } = req.body;
  if (!(title && price && availableQuantity && category)) {
    res.status(400).json({
      message:
        "Title, Price, AvailableQuantity and category are the required fields",
    });
  }
  const product = await Product.findOne({ title });
  console.log("Product ---> ", product);
  if (product) {
    return res
      .status(409)
      .json({ error: "Product with this title already available" });
  } else {
    console.log("role --> ", checkValidRole(req.user.email));
    checkValidRole(req.user.email)
      .then(async (result) => {
        console.log(result);
        if (result) {
          const product = await Product.create({
            title,
            description,
            price,
            availableQuantity, // sanitize: convert email to lowercase
            category,
            otherProperties,
          });
          res.status(201).json(product);
        } else {
          res
            .status(403)
            .json({ message: "You are not allowed to Add Product" });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
});
router.delete("/delete-product/:productId", verifyToken, async (req, res) => {
  const productId = req.params.productId;
  try {
    const deletedProduct = await Product.findByIdAndRemove(productId);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update-product/:productId", verifyToken, async (req, res) => {
  const productId = req.params.productId;
  console.log(productId);
  const updatedProduct = req.body;
  try {
    const product = await Product.findByIdAndUpdate(productId, updatedProduct, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/search", verifyToken, async (req, res) => {
  const searchTerm = req.query.q;
  try {
    const products = await Product.find({
      title: { $regex: searchTerm, $options: "i" },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
