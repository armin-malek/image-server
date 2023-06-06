const { prisma } = require("./db");
const axios = require("axios").default;
const DOMAIN_ROOT = process.env.DOMAIN_ROOT;
const ZIBAL_MERCHANT = process.env.ZIBAL_MERCHANT;

async function startPayment(amount, usermobile, description) {
  return await zibalStartPayment(amount, usermobile, description);
}

async function verifyPayment(trackId, amount) {
  return await zibalVerifyPayment(trackId);
}

async function zibalStartPayment(amount, usermobile, description) {
  try {
    const { data } = await axios.post("https://gateway.zibal.ir/v1/request", {
      merchant: ZIBAL_MERCHANT,
      amount: amount,
      callbackUrl: DOMAIN_ROOT + "/payment/land",
      mobile: usermobile,
      description,
    });

    switch (data.result) {
      case 100:
        return {
          error: false,
          paymentUrl: "https://gateway.zibal.ir/start/" + data.trackId,
          trackId: data.trackId.toString(),
          gateWay: "Zibal",
        };
      case 102:
        return { error: true, message: "کد مرچانت در زیبال وجود ندارد" };
      case 103:
        return { error: true, message: "مرچانت غیرفعال شده" };
      case 104:
        return { error: true, message: "کد مرچانت صحیح نیست" };
      case 105:
        return {
          error: true,
          message: "مبلغ پرداخت باید بیش از 1000 ریال باشد",
        };
      case 106:
        return { error: true, message: "لینک بازگشت پرداخت نا معتبر است" };
      case 113:
        return {
          error: true,
          message: "مبلغ تراکنش از سقف میزان تراکنش بیشتر است.",
        };
      default:
        return { error: true, message: "خطای ناشناس زیبال" };
    }
  } catch (e) {
    //console.error("Zibal Start Payment Error: ", e);
    return { error: true, message: "خطایی در ارتباط با درگاه رخ داد" };
  }
}

async function zibalVerifyPayment(trackId) {
  try {
    const { data } = await axios.post("https://gateway.zibal.ir/v1/verify", {
      merchant: ZIBAL_MERCHANT,
      trackId,
    });

    switch (data.result) {
      case 100:
        if (data.status === 1 || data.status === 2)
          return {
            error: false,
            cardNumber: data.cardNumber,
            refNumber: data.refNumber,
          };
        else {
          return {
            error: true,
            message:
              "وضعیت پرداخت ناشناس است در صورت وجود مشکل با پشتیبانی در ارتباط باشید",
          };
        }
      case 102:
        return { error: true, message: "کد مرچانت در زیبال وجود ندارد" };
      case 103:
        return { error: true, message: "مرچانت غیرفعال شده" };
      case 104:
        return { error: true, message: "کد مرچانت صحیح نیست" };
      case 201:
        return {
          error: true,
          message:
            "این سفارش قبلا تایید شده در صورت وجود مشکل با پشتیبانی در ارتباط باشید",
        };
      case 202:
        return {
          error: true,
          message: "سفارش پرداخت نشده یا ناموفق بوده است.",
        };
      case 203:
        return { error: true, message: "شناسه پرداخت نامعتبر می باشد" };
      default:
        return { error: true, message: "خطای ناشناس زیبال" };
    }
  } catch (e) {
    //console.log("Zibal payment verify Error", e);
    return { error: true, message: "خطایی در ارتباط با درگاه رخ داد" };
  }
}

module.exports.startPayment = startPayment;
module.exports.verifyPayment = verifyPayment;
