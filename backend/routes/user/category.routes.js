const express = require("express");
const router = express.Router();
const categoryController = require("../../controller/user/category.controller");


router.get("/", categoryController.getCategoriesList);
router.get("/:id", categoryController.getCategory);

module.exports = router;
