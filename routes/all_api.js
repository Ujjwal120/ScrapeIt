const express = require("express");
const router = express.Router();
const Browser = require("./../controllers/headlessBrowser");

router.post("/startPupeteer", async (req, res, next) => {
    await Browser.headLessBrowser(req.body.username, req.body.password);
    
    return res.status(200).send();
})

module.exports = router;
