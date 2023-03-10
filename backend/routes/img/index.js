const express = require("express");
const router = express.Router();
const fs = require("fs/promises");
const sharp = require("sharp");

router.get("/", (req, res) => res.send("image Route!"));

// handle image request
router.get("/:imageName", async (req, res) => {
  try {
    const { imageName } = req.params;
    const { width } = req.query;

    // load image to the Sharp
    let image = await sharp("./imgs/" + imageName)
      .resize(width ? parseInt(width) : 500)
      .webp()
      .toBuffer();

    // send the image Buffer
    res.setHeader("Content-Type", "image/jpeg").send(image);
  } catch (err) {
    console.log(err);
    res.status(500).send("error");
  }
});

module.exports = router;
