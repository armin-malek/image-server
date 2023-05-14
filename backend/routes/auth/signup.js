// فریم ورک وب
const express = require("express");
const router = express.Router();
// کتابهانه هش الگوریتم bcrypt
const bcrypt = require("bcryptjs");
// ارتباط با دیتابیس
const { prisma } = require("../../lib/db");
const moment = require("moment");

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return res.send({
        ok: false,
        msg: "قبلا با این ایمیل ثبت نام شده است.",
      });
    }

    // تولید سالت برای ایجاد هش
    const salt = await bcrypt.genSalt();
    // تولید هش از پسورد
    const hash = await bcrypt.hash(password, salt);

    // ایجاد کاربر در دیتابیس
    await prisma.user.create({
      data: {
        email: email,
        password: hash,
        role: "Customer",
        dateRegistered: moment().toISOString(),
        registerIP: req.ip,
        isActive: true,
      },
    });

    return res.send({ ok: true, msg: "حساب شما با موفقیت ایجاد شد." });
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "خطایی در سیستم رخ داد" });
    return;
  }
});
module.exports = router;
