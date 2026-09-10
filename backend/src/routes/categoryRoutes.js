const express = require("express");
const categoryController = require("../controllers/categoryController");
const authenticate = require("../middleware/auth");

const router = express.Router();

// Applied to every route below, so no category data is reachable without a token
router.use(authenticate);

router.get("/", categoryController.list);
router.post("/", categoryController.create);

// The bulk route is declared before "/:id" so that "bulk-delete"
// is not captured as an id parameter
router.post("/bulk-delete", categoryController.bulkRemove);

router.get("/:id", categoryController.getById);
router.put("/:id", categoryController.update);
router.delete("/:id", categoryController.remove);

module.exports = router;