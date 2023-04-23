const express = require("express");
const router = express.Router();
const sharp = require("sharp");
const { prisma } = require("../../lib/db");
const { s3, S3_BUCKET, getObject } = require("../../lib/s3");
const mime = require("mime-types");
const { BigNumber } = require("bignumber.js");

router.get("/", (req, res) => res.send("image Route!"));

// list of available image widths
const widthList = [50, 150, 320, 500, 750, 900, 1080];

// handle image request
router.get("/:imageName", async (req, res) => {
  try {
    const startTime = Date.now();
    const { imageName } = req.params;
    let { width } = req.query;

    width = width ? parseInt(width) : 900;

    // select closet width value
    width = widthList.reduce(function (prev, curr) {
      return Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev;
    });
    // check if files exists in DataBase

    const fileInDB = await prisma.file.findUnique({
      where: { fileName: imageName },
      select: {
        id: true,
        Customer: { select: { id: true, trafficUsed: true } },
      },
    });

    if (!fileInDB) {
      return res.status(404).send("404 - NOT FOUND");
    }

    // prepare cached file name
    let cacheFileName = `cache/${imageName.split(".")[0]}-${width}.${
      imageName.split(".")[1]
    }`;
    // check and get cached file

    let cachedFile = await getObject(cacheFileName);
    if (cachedFile) {
      const remainingTraffic =
        BigInt(50 * 1024 * 1024 * 1024) - fileInDB.Customer.trafficUsed;
      if (remainingTraffic < cachedFile.Body.byteLength) {
        return res.status(503).send("Traffic limit reached");
      }
      // send cached file
      res
        .setHeader("Content-Type", mime.lookup(cacheFileName))
        .setHeader("Process-Time", Date.now() - startTime)
        .setHeader("From-Cache", true)
        .setHeader("width", width)
        .send(cachedFile.Body);

      await prisma.customer.update({
        where: { id: fileInDB.Customer.id },
        data: {
          trafficUsed: { increment: BigInt(cachedFile.Body.byteLength) },
        },
      });

      return;
    }

    // Load File from S3
    const object = await s3
      .getObject({ Bucket: S3_BUCKET, Key: imageName })
      .promise();

    // resize image
    let image = await sharp(object.Body).resize(width).toBuffer();

    // send the image Buffer
    res
      .setHeader("Content-Type", mime.lookup(imageName))
      .setHeader("Process-Time", Date.now() - startTime)
      .setHeader("width", width)
      .send(image);

    // save image in cache
    await s3
      .putObject({ Bucket: S3_BUCKET, Key: cacheFileName, Body: image })
      .promise();

    await prisma.customer.update({
      where: { id: fileInDB.Customer.id },
      data: { trafficUsed: { increment: BigInt(image.byteLength) } },
    });

    // reduce credits based on file size
  } catch (err) {
    console.log(err);
    res.status(500).send("somthing went wrong");
  }
});

module.exports = router;
