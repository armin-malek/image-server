const express = require("express");
const { prisma } = require("../../lib/db");
const router = express.Router();
const moment = require("moment");
const { verifyPayment } = require("../../lib/payment");
const DOMAIN_FRONT = process.env.DOMAIN_FRONT;

router.get("/", async (req, res) => {
  try {
    const { trackId, status, success } = req.query;

    let payment = await prisma.payment.findUnique({
      where: {
        transActionCode: trackId.toString(),
      },
      select: {
        status: true,
        id: true,
        Order: {
          select: {
            Customer: { select: { id: true, CustomerSubscriptionPlan: true } },
            subscriptionPlanId: true,
          },
        },
      },
    });

    if (!payment) {
      return res.redirect(
        `${DOMAIN_FRONT}/cp/orders?pok=false&pmsg=${encodeURI(
          "سفارش مورد نظر در سیستم وجود ندارد."
        )}`
      );
    }

    if (payment.status !== "INPROGRESS") {
      return res.redirect(
        `${DOMAIN_FRONT}/cp/orders?pok=false&pmsg=${encodeURI(
          "این سفارش قبلا پرداخت شده ویا لفو شده است."
        )}`
      );
    }

    if (success != 1) {
      return res.redirect(
        `${DOMAIN_FRONT}/cp/orders?pok=false&pmsg=${encodeURI(
          "پرداخت ناموفق!"
        )}`
      );
    }
    if (status != 1 && status != 2) {
      return res.redirect(
        `${DOMAIN_FRONT}/cp/orders?pok=false&pmsg=${encodeURI(
          "پرداخت ناموفق!"
        )}`
      );
    }
    let verfiedPayment = await verifyPayment(trackId);
    if (!verfiedPayment) throw new Error("payment veification faild");
    if (verfiedPayment.error === true) {
      return res.redirect(
        `${DOMAIN_FRONT}/cp/orders?pok=false&pmsg=${encodeURI(
          verfiedPayment.message
        )}`
      );
    }

    const date = moment();
    const orderUpdate = prisma.order.update({
      where: { paymentId: payment.id },
      data: {
        status: "Payed",
        Payment: {
          update: {
            status: "PAYED",
            dateFinalized: date.toISOString(),
            gateWayCardNumber: verfiedPayment.cardNumber,
            gateWayRefNumber: verfiedPayment.refNumber,
          },
        },
      },
    });

    const subUpdate = prisma.customer.update({
      where: { id: payment.Order.Customer.id },
      data: {
        storageUsed: 0,
        trafficUsed: 0,
        CustomerSubscriptionPlan: {
          delete: payment.Order.Customer.CustomerSubscriptionPlan
            ? true
            : false,
          create: {
            startedAt: date.toISOString(),
            exipresAt: date.add(30, "days").toISOString(),
            SubscriptionPlan: {
              connect: { id: payment.Order.subscriptionPlanId },
            },
          },
        },
      },
    });

    await prisma.$transaction([orderUpdate, subUpdate]);
    return res.redirect(
      `${DOMAIN_FRONT}/cp/orders?pok=true&pmsg=${encodeURI(
        "پلن مورد نظر فعال شد."
      )}`
    );
  } catch (err) {
    console.log(err);
    return res.redirect(
      `${DOMAIN_FRONT}/cp/orders?pok=true&pmsg=${encodeURI("خطایی رخ داد")}`
    );
  }
});

module.exports = router;
