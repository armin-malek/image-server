const moment = require("moment-timezone");

function base64TOBuffer(base64) {
  let uri = base64.split(";base64,").pop();
  return Buffer.from(uri, "base64");
}

function currentIranTimeDB() {
  return moment().tz("Asia/Tehran").toISOString();
}

module.exports.base64TOBuffer = base64TOBuffer;
module.exports.currentIranTimeDB = currentIranTimeDB;
