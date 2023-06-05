const express = require("express");
const { prisma } = require("../../../lib/db");
const router = express.Router();
const moment = require("moment");
const { startPayment } = require("../../../lib/payment");

router.post("/", async (req, res) => {
  try {
    const { planID } = req.body;
    if (!planID) {
      return res.send({
        ok: false,
        msg: "شناسه پلن لازم است.",
      });
    }
    const date = moment();
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        Customer: {
          select: {
            id: true,
            CustomerSubscriptionPlan: {
              select: {
                exipresAt: true,
              },
            },
          },
        },
      },
    });

    if (
      user.Customer.CustomerSubscriptionPlan &&
      moment(user.Customer.CustomerSubscriptionPlan.exipresAt).isAfter(date)
    ) {
      // مشتری پلن فعال دارد و نمی تواند پلن جدیدی را بخرد
      return res.send({
        ok: false,
        msg: "شما پلن فعالی دارید و نمی توانید پلن جدیدی را خریداری کنید.",
      });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planID },
      select: { id: true, title: true, isActive: true, basePrice: true },
    });

    if (!plan || plan.isActive == false) {
      return res.send({
        ok: false,
        msg: "این پلن قابل خرید نیست.",
      });
    }
    const startedPayment = await startPayment(
      plan.basePrice * 10,
      "",
      `خرید پلن ${plan.title} به مدت یک ماه`
    );

    if (startedPayment.error) {
      return res.send({
        ok: false,
        msg: startedPayment.message,
      });
    }

    await prisma.order.create({
      data: {
        cost: plan.basePrice,
        date: date.toISOString(),
        status: "Unpaid",
        SubscriptionPlan: { connect: { id: plan.id } },
        Payment: {
          create: {
            amount: plan.basePrice,
            dateCreated: date.toISOString(),
            status: "INPROGRESS",
            transActionCode: startedPayment.trackId.toString(),
            userIP: req.ip,
          },
        },
        Customer: { connect: { id: user.Customer.id } },
      },
    });

    res.send({ ok: true, redirect: startedPayment.paymentUrl });
  } catch (err) {
    console.log(err);
    res.status(500).send("خطایی رخ داد");
  }
});

module.exports = router;
