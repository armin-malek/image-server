const express = require("express");
const { prisma } = require("../../../lib/db");
const sharp = require("sharp");
const { putObject } = require("../../../lib/s3");
const { currentIranTimeDB, base64TOBuffer } = require("../../../lib/functions");
const router = express.Router();
const moment = require("moment");
const BigNumber = require("bignumber.js").default;

router.post("/", async (req, res) => {
  try {
    let { img } = req.body;

    // get user Customer Table info
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        Customer: {
          select: {
            id: true,
            storageUsed: true,
            CustomerSubscriptionPlan: {
              select: { SubscriptionPlan: { select: { storageLimit: true } } },
            },
          },
        },
      },
    });

    img = base64TOBuffer(img);
    const metaData = await sharp(img).metadata();
    // 50 GB
    let maxStorage = new BigNumber(
      user.Customer.CustomerSubscriptionPlan.SubscriptionPlan.storageLimit
    );
    const remainingStorage = maxStorage.minus(user.Customer.storageUsed);
    // console.log("remainingStorage", remainingStorage);
    // console.log("metaData.size", metaData.size);

    // check if user has enough storage capacity
    if (remainingStorage.lt(metaData.size))
      return res.send({
        ok: false,
        msg: "فضای کافی برای آپلود این فایل را ندارید",
        remainingStorage,
      });

    // max width 1920 pixels
    let newBuffer = await sharp(img)
      .resize(Math.min(metaData.width, 1920))
      .webp()
      .toBuffer();

    const uploadedFile = await putObject(newBuffer, "image/webp");

    const customerUpdate = await prisma.customer.update({
      where: { id: user.Customer.id },
      data: {
        Files: {
          create: {
            dateCreated: moment().toISOString(),
            fileName: uploadedFile.fileName,
          },
        },
        storageUsed: { increment: metaData.size },
      },
      select: { storageUsed: true },
    });

    return res.send({
      ok: true,
      fileName: uploadedFile.fileName,
      remainingStorage: maxStorage
        .minus(new BigNumber(customerUpdate.storageUsed))
        .toString(),
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
