const express = require("express");
const router = express.Router();
router.use(require("../../middleware/jwt"));

router.get("/", (req, res) => {
  res.send("cp");
});
router.use("/library", require("./library"));
module.exports = router;
