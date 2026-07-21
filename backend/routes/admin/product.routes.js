const express = require("express");
const router = express.Router();
const productController = require("../../controller/admin/product.controller");
const { authenticateAdmin } = require("../../middleware/auth");
const { uploadMultiple } = require("../../helper/fileupload");

router.use(authenticateAdmin);

router.get("/", productController.getProductsList);
router.get("/:id", productController.getProduct);
router.post("/add", uploadMultiple('images', 'products', 4), productController.addProduct);
router.put("/update/:id", uploadMultiple('images', 'products', 4), productController.updateProduct);
router.put("/update-status/:id", productController.updateProductStatus);
router.delete("/delete/:id", productController.deleteProduct);

module.exports = router;
