const express = require("express");
const app = express();
const port = process.env.PORT || 4000;

app.use("/", require("./routes"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
