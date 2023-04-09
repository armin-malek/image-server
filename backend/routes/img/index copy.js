const express = require("express");
const router = express.Router();
const fs = require("fs");
const sharp = require("sharp");
const { prisma } = require("../../lib/db");
const { s3, S3_BUCKET } = require("../../lib/s3");
const mime = require("mime-types");

router.get("/", (req, res) => res.send("image Route!"));

// handle image request
router.get("/:imageName", async (req, res) => {
  try {
    const startTime = Date.now();
    const { imageName } = req.params;
    let { width } = req.query;
    width = width ? parseInt(width) : 500;

    // check if files exists in DataBase
    const fileInDB = await prisma.file.findUnique({
      where: { fileName: imageName },
      select: { id: true, Customer: { select: { id: true, credits: true } } },
    });

    if (!fileInDB) {
      return res.status(404).send("404 - NOT FOUND");
    }

    let cacheFilePath = `./file-cache/${imageName.split(".")[0]}-${width}.${
      imageName.split(".")[1]
    }`;
    cacheFileName = cacheFilePath.split("/").pop();
    // check if file exists in cache
    let cacheExists = await checkFileExists(cacheFilePath);
    if (cacheExists) {
      // send cached file
      const file = await fs.promises.readFile(cacheFilePath);
      return res
        .setHeader("Content-Type", mime.lookup(cacheFileName))
        .setHeader("PROCESS-TIME", Date.now() - startTime)
        .setHeader("FROM-CACHE", true)
        .send(file);
    }

    // Load File from S3
    const object = await s3
      .getObject({ Bucket: S3_BUCKET, Key: imageName })
      .promise();
    // load image to the Sharp

    // resize image
    let image = await sharp(object.Body).resize(width).toBuffer();

    // save image in cache
    await fs.promises.writeFile(cacheFilePath, image);

    // send the image Buffer
    res
      .setHeader("Content-Type", mime.lookup(imageName))
      .setHeader("PROCESS-TIME", Date.now() - startTime)
      .send(image);
  } catch (err) {
    console.log(err);
    res.status(500).send("error");
  }
});

function checkFileExists(file) {
  return new Promise((r) => fs.access(file, fs.constants.F_OK, (e) => r(!e)));
}

module.exports = router;
