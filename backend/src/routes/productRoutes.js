const express = require("express");
const productController = require("../controllers/productController");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/", productController.list);
router.post("/", productController.create);
router.get("/:id", productController.getById);
router.put("/:id", productController.update);
router.delete("/:id", productController.remove);

module.exports = router;