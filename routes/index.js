const express = require("express");
const router = express.Router();

router.use("/ScrapeIt", require("./all_api"));

module.exports = router;