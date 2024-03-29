const JWT = require("jsonwebtoken");
const { prisma } = require("../lib/db");
const JWT_SECRET = process.env.JWT_SECRET;
module.exports = async (req, res, next) => {
  try {
    //export jwt from the Header OR cookies
    let token = req.headers["jwt"] || req.cookies["jwt"];

    if (!token) {
      return res.status(401).send("باید وارد سیستم شده باشید.");
    }
    // verify jwt
    const decoded = JWT.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        fullName: true,
        isActive: true,
        role: true,
        Customer: { select: { id: true } },
      },
    });

    if (!user) {
      return res.status(401).send({ ok: false, msg: "کاربر وجود ندارد" });
    }
    if (user.role == "Customer" && !user.Customer) {
      return res
        .status(401)
        .send({ ok: false, msg: "کاربر مورد نظر تعریف نشده است" });
    }
    // asign user to request object
    req.user = user;
    return next();
    //JWT.verify()
  } catch (err) {
    console.log(err);
    res.status(401).send("توکن نامعتبر");
  }
};
