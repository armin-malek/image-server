require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;

const requestIp = require("request-ip");

app.use(requestIp.mw());
app.use(express.json({ limit: "20mb" }));
app.use(express.static("./public"));

app.use("/", require("./routes"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
