const express = require("express");
const router = express.Router();

router.use("/login", require("./login.js"));
router.use("/signup", require("./signup.js"));

router.use("/email-verify", require("./email-verify.js"));
router.use(require("../../middleware/jwt.js"));
router.use("/email-req", require("./email-req.js"));
module.exports = router;
