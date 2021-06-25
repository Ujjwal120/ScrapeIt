const express = require('express');
const bodyParser= require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json({limit : '10mb'}));
app.use(bodyParser.urlencoded({limit : '10mb', extended : true}));

app.get("/", (req, res, next) => {
    res.sendFile(__dirname + '/index.html');
})

app.post("/startPupeteer", async (req, res, next) => {
    await headLessBrowser(req.body.username, req.body.password);
    
    return res.status(200).send();
})


/**
 * @param  {string} uname
 * @param  {string} pass
 */
const headLessBrowser = async (uname, pass) => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 70, // slow down by 250ms
    });

    const page = await browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36');

    await page.goto('https://instagram.com', { waitUntil : 'networkidle2'})

    await fillInput(page, 'username', uname);
    await fillInput(page, 'password', pass);
    
    const loginButton = await page.$('button.sqdOP.L3NKy.y3zKF');
    await loginButton.click();

    await page.waitForSelector('.q9xVd', {visible : true});
    const homeDiv = await page.$('div.q9xVd');
    const homeButton = await homeDiv.$('a');
    await homeButton.click();

    await page.waitForSelector('.aOOlW.HoLwm', {visible : true});
    const notNowButton = await page.$('button.aOOlW.HoLwm');
    await notNowButton.click();
    
    // browser can be closed just by un-commenting the line below
    // await browser.close();   
}

/**
 * @param  {Page} page
 * @param  {string} fieldName
 * @param  {string} value
 */
const fillInput = async (page, fieldName, value) => {
    await page.waitForSelector(`input[name=${fieldName}]`, {visible : true});

    const usernameInput = await page.$(`input[name=${fieldName}]`);

    await usernameInput.type(value);
}

app.listen(3000, () => {
    console.log("listening to port 3000");
})