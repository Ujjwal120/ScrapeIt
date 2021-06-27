const express = require("express");
const router = express.Router();
const Browser = require("./../controllers/headlessBrowser");

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://ujju120:Ujjun@120@cluster0.hd1pv.mongodb.net/scrapeInsta?retryWrites=true&w=majority";

router.post("/startPupeteer", async (req, res, next) => {
    
    const [
        page, 
        browser, 
        unseenStoriesData,
        MonitorRequests
    ] = await Browser
        .headLessBrowser(req.body.username, req.body.password);
    
    if(!MonitorRequests.loginSuccess) {
        // close the browser
        await browser.close();
        
        await client.close();
        
        return res.status(200).send("Wrong Password / Username !!");
    }

    await MonitorRequests.waitForAllRequests();

    let cancelButton = await page.evaluate(() => {
        return document.querySelector('.QBdPU');
    })

    let RightButtonPresent = await page.evaluate(() => {
        return document.querySelector('.coreSpriteRightChevron');
    });

    while(RightButtonPresent !== null && cancelButton !== null) {
        
        await page.waitForSelector('.QBdPU', {visible : true});
        await page.waitForSelector('.coreSpriteRightChevron', {visible : true});

        const rightButtonDiv = await page.$('div.coreSpriteRightChevron');
        await rightButtonDiv.click();

        await MonitorRequests.waitForAllRequests();

        cancelButton = await page.evaluate(() => {
            return document.querySelector('.QBdPU');
        })

        RightButtonPresent = await page.evaluate(() => {
            return document.querySelector('.coreSpriteRightChevron');
        });
    }

    await MonitorRequests.waitForAllRequests();

    const client = new MongoClient(uri, { useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db('scrapeInsta');
       
        // insert stories 
        let stories = [];
        for(let i = 0; i < unseenStoriesData.data.length; i++) {
            const cursor = await db.collection('stories').findOne({ 
                id : unseenStoriesData.data[i].id
            });

            if(cursor === null) {
                stories.push(unseenStoriesData.data[i]);
                await db.collection('stories')
                 .insertOne(unseenStoriesData.data[i]);
            }
        }

        // const db_cursor = await db.collection('stories').find();
        
        // let db_stories = [];

        // await db_cursor.forEach((doc) => {
        //     db_stories.push(doc);
        // })

        // insert new users if any
        for(let i = 0; i < unseenStoriesData.users.length; i++) {
            const cursor = await db.collection('users').findOne({ 
                pk : unseenStoriesData.users[i].pk
            });

            if(cursor === null) {
                await db.collection('users')
                 .insertOne(unseenStoriesData.users[i]);
            }
        }

        // close the browser here
        await browser.close();

        await client.close();

        return res.status(200).json(stories);
    }
    catch(err) {
        // close the browser here
        await browser.close();

        await client.close();

        res.status(400).send({
            message : err
        })
    }
    
})

module.exports = router;
