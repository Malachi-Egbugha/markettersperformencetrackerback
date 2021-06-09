const express = require("express");
const router = express.Router();
const { validateBody, schemas } = require("../middleware/validateschema");
const { protect, authorize } = require("../middleware/auth");
const { signup, signin, signout } = require("../controllers/auth");

router.post(
  "/signup",
  validateBody(schemas.authSchema),
  protect,
  authorize("admin", "superadmin"),
  signup
);
router.post("/signin", validateBody(schemas.authSchema), signin);
router.post("/signout", signout);

module.exports = router;
