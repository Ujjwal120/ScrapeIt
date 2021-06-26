const express = require("express");
const router = express.Router();
const Browser = require("./../controllers/headlessBrowser");

router.post("/startPupeteer", async (req, res, next) => {
    
    const [page, browser, results] = await Browser.headLessBrowser(req.body.username, req.body.password);
    
    // console.log(results);

    // close the browser here
    // await browser.close();

    return res.status(200).send();
})

module.exports = router;
