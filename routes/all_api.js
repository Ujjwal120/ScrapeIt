const express = require("express");
const router = express.Router();
const Browser = require("./../controllers/headlessBrowser");
const PuppeteerNetworkMonitor = require('../controllers/PuppeteerNetwork');

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://ujju120:Ujjun@120@cluster0.hd1pv.mongodb.net/scrapeInsta?retryWrites=true&w=majority";

router.post("/startPupeteer", async (req, res, next) => {
    
    const [
        page, 
        browser, 
        unseenStoriesData
    ] = await Browser
        .headLessBrowser(req.body.username, req.body.password);
    
    if(page === null) {
        return res.status(200).send("No more new stories !!");
    }

    // class of cross button .QBdPU 

    let monitorRequests = new PuppeteerNetworkMonitor(page);
    await monitorRequests.waitForAllRequests();

    await page.waitForSelector('.QBdPU', {visible : true});
    await page.waitForSelector('.coreSpriteRightChevron', {visible : true});

    let cancelButton = await page.evaluate(() => {
        return document.querySelector('.QBdPU');
    })

    let RightButtonPresent = await page.evaluate(() => {
        return document.querySelector('.coreSpriteRightChevron');
    });

    while(RightButtonPresent !== null && cancelButton !== null) {
        const rightButtonDiv = await page.$('div.coreSpriteRightChevron');
        await rightButtonDiv.click();

        await monitorRequests.waitForAllRequests();

        cancelButton = await page.evaluate(() => {
            return document.querySelector('.QBdPU');
        })

        RightButtonPresent = await page.evaluate(() => {
            return document.querySelector('.coreSpriteRightChevron');
        });
    }

    // console.log(unseenStoriesData.data);
    console.log('sadsadsda', unseenStoriesData.data.length);

    const client = new MongoClient(uri, { useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db('scrapeInsta');
       
        // insert stories
        await db.collection('stories')
          .insertMany(unseenStoriesData.data);

        // insert new users if any
        for(let i = 0; i < unseenStoriesData.users.length; i++) {
            const cursor = db.collection('users').findOne({ 
                pk : unseenStoriesData.users[i].pk
            });

            if(cursor !== null) {
                await db.collection('users')
                 .insertOne(unseenStoriesData.users[i]);
            }
        }
    }
    catch(err) {
        console.log(error);
    }
    finally {
        await client.close();
    }

    // close the browser here
    await browser.close();
    
    return res.status(200).send({
        data : unseenStoriesData.data,
    }).json();
})

module.exports = router;
