const express = require("express");
const { prisma } = require("../../lib/db");
const router = express.Router();
const moment = require("moment");
router.use(require("../../middleware/jwt"));

router.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        email: true,
        emailVerified: true,
        fullName: true,
        Customer: {
          select: {
            storageUsed: true,
            trafficUsed: true,
            _count: { select: { Files: true } },
            CustomerSubscriptionPlan: {
              select: {
                startedAt: true,
                exipresAt: true,
                SubscriptionPlan: { select: { title: true } },
              },
            },
          },
        },
      },
    });

    // tabdil BigInt ha be string
    user.Customer.storageUsed = user.Customer.storageUsed.toString();
    user.Customer.trafficUsed = user.Customer.trafficUsed.toString();

    let hasPlan = false;
    if (
      user.Customer.CustomerSubscriptionPlan &&
      moment(user.Customer.CustomerSubscriptionPlan.exipresAt).isAfter(moment())
    )
      hasPlan = true;

    const customerSub = hasPlan ? user.Customer.CustomerSubscriptionPlan : null;
    delete user.Customer.CustomerSubscriptionPlan;
    res.send({
      ok: true,
      user,
      customerSub,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("خطایی رخ داد");
  }
});

router.use("/library", require("./library"));
router.use("/subscription", require("./subscription"));
module.exports = router;
