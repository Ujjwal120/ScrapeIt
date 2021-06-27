const puppeteer = require('puppeteer');
const request = require('./networkInterceptor');

/**
 * @param  {string} uname
 * @param  {string} pass
 */
 module.exports.headLessBrowser = async (uname, pass) => {
    const browser = await puppeteer.launch({
        // headless: false,   // remove this to not launch Chrommium
        slowMo: 20, // slow down by 250ms
        args:['--no-sandbox']
    });

    const page = await browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36');

    await page.goto('https://instagram.com', { waitUntil : ['domcontentloaded', 'networkidle0'], timeout : 0});

    await fillInput(page, 'username', uname);
    await fillInput(page, 'password', pass);
    
    let unseenStoriesData = {
        data : [],
        users : [],
    };

    let MonitorRequests = {
        loginSuccess : true,
        resourceType : ['xhr'],
        pendingRequests : new Set(),
        promises : [],
        waitForAllRequests : async function() {
            if (this.pendingRequestCount() === 0) {
                return;
            }
            await Promise.all(this.promises);
        },
        pendingRequestCount : function () {
            return this.pendingRequests.size;
        }
    }
   
    await request.networkInterceptor(page, unseenStoriesData, MonitorRequests);

    const loginButton = await page.$('button.sqdOP.L3NKy.y3zKF');
    await loginButton.click();

    await page.waitForResponse(response => {
        return (response.request().resourceType() === 'xhr') && 
            (response.request().url().includes('/logging/falco'));
    });
    

    if(!MonitorRequests.loginSuccess) {
        return [page, browser, unseenStoriesData, MonitorRequests];
    }

    await page.waitForSelector('.q9xVd', {visible : true});
    const homeDiv = await page.$('div.q9xVd');
    const homeButton = await homeDiv.$('a');
    await homeButton.click();

    /*
        un-comment the 3 lines below in case using {headless : false}
    */
    // await page.waitForSelector('.aOOlW.HoLwm', {visible : true});
    // const notNowButton = await page.$('button.aOOlW.HoLwm');
    // await notNowButton.click();
    
    await page.waitForSelector('._6q-tv', {visible : true});
    const img = await page.$('img._6q-tv');
    await img.click();
    
    return [page, browser, unseenStoriesData, MonitorRequests];
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