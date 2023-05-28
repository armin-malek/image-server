// فریم ورک وب
const express = require("express");
const router = express.Router();
// کتابهانه هش الگوریتم bcrypt
const bcrypt = require("bcryptjs");
// ارتباط با دیتابیس
const { prisma } = require("../../lib/db");
const moment = require("moment");
const JWT = require("jsonwebtoken");
const jwtsecret = process.env.JWT_SECRET;
const jwtexp = process.env.JWTEXP;

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
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hash,
        role: "Customer",
        dateRegistered: moment().toISOString(),
        registerIP: req.ip,
        isActive: true,
        Customer: { create: {} },
      },
      select: { id: true },
    });

    const jwtToken = JWT.sign({ id: user.id }, jwtsecret, {
      expiresIn: parseInt(jwtexp),
    });
    // set cookie
    res.cookie("jwt", jwtToken, {
      httpOnly: true,
      sameSite: "None",
      secure: false,
      maxAge: parseInt(jwtexp),
    });
    return res.send({ ok: true, msg: "حساب شما با موفقیت ایجاد شد." });
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "خطایی در سیستم رخ داد" });
    return;
  }
});
module.exports = router;
