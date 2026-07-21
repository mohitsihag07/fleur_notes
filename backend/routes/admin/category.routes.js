const express = require("express");
const router = express.Router();
const categoryController = require("../../controller/admin/category.controller");
const { authenticateAdmin } = require("../../middleware/auth");
const { uploadSingle } = require("../../helper/fileupload");

router.use(authenticateAdmin);

router.get("/", categoryController.getCategoriesList);
router.get("/:id", categoryController.getCategory);
router.post("/add", uploadSingle('image', 'categories'), categoryController.addCategory);
router.put("/update/:id", uploadSingle('image', 'categories'), categoryController.updateCategory);
router.put("/update-status/:id", categoryController.categoryStatusUpdate);
router.delete("/delete/:id", categoryController.deleteCategory);

module.exports = router;
