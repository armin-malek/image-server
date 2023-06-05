const express = require("express");
const router = express.Router();
router.get("/", (req, res) => res.sendFile("Hello World!"));

router.use("/img", require("./img"));
router.use("/cp", require("./cp"));
router.use("/auth", require("./auth"));
router.use("/payment", require("./payment"));
module.exports = router;
