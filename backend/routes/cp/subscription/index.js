const express = require("express");
const { prisma } = require("../../../lib/db");
const router = express.Router();
const moment = require("moment");

router.get("/", async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        basePrice: true,
        bandwidthLimit: true,
        storageLimit: true,
      },
    });

    plans.map((plan) => {
      let div = BigInt(1024);
      plan.bandwidthLimit = (plan.bandwidthLimit / div / div / div).toString();
      plan.storageLimit = (plan.storageLimit / div / div / div).toString();
    });
    res.send({
      ok: true,
      plans,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("خطایی رخ داد");
  }
});

router.use("/buy", require("./buy"));

module.exports = router;
