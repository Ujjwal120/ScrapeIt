const express = require("express");
const router = express.Router();
const Browser = require("./../controllers/headlessBrowser");
const PuppeteerNetworkMonitor = require('../controllers/PuppeteerNetwork');

router.post("/startPupeteer", async (req, res, next) => {
    
    const [
        page, 
        browser, 
        activeStoriesUserInfo,
        unseenStoriesData
    ] = await Browser
        .headLessBrowser(req.body.username, req.body.password);
    
    if(page === null) {
        return res.status(200).send("No more new stories !!");
    }

    console.log(activeStoriesUserInfo.data.length);

    // class of cross button .QBdPU 

    let monitorRequests = new PuppeteerNetworkMonitor(page);
    await monitorRequests.waitForAllRequests();

    let RightButtonPresent = await page.evaluate(() => {
        return document.querySelector('.coreSpriteRightChevron');
    });


    while(RightButtonPresent !== null) {
        const rightButtonDiv = await page.$('div.coreSpriteRightChevron');
        await rightButtonDiv.click();

        await monitorRequests.waitForAllRequests();

        RightButtonPresent = await page.evaluate(() => {
            return document.querySelector('.coreSpriteRightChevron');
        });

        break;
    }

    // close the browser here
    // await browser.close();

    return res.status(200).send();
})

module.exports = router;
