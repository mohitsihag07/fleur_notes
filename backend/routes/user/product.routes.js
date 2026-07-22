const express = require("express");
const router = express.Router();
const productController = require("../../controller/user/products.controller");

router.get("/featured", productController.featuredProducts);
router.get("/bestseller", productController.bestsellerProducts);
router.get("/new", productController.newProducts);
router.get("/", productController.getProductsList);
router.get("/:id", productController.getProduct);

module.exports = router;
