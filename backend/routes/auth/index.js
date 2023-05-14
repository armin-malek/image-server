const express = require("express");
const router = express.Router();

router.use("/login", require("./login.js"));
router.use("/signup", require("./signup.js"));
module.exports = router;
