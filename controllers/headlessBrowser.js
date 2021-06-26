const puppeteer = require('puppeteer');
const request = require('./networkInterceptor');

/**
 * @param  {string} uname
 * @param  {string} pass
 */
 module.exports.headLessBrowser = async (uname, pass) => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 70, // slow down by 250ms
    });

    const page = await browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36');

    await page.goto('https://instagram.com', { waitUntil : ['domcontentloaded', 'networkidle0'], timeout : 0});

    await fillInput(page, 'username', uname);
    await fillInput(page, 'password', pass);
    
    let activeStoriesUserInfo = {
        data : [],
    };
    let unseenStoriesData = {
        data : [],
    };
    await request.networkInterceptor(page, activeStoriesUserInfo);

    const loginButton = await page.$('button.sqdOP.L3NKy.y3zKF');
    await loginButton.click();

    await page.waitForSelector('.q9xVd', {visible : true});
    const homeDiv = await page.$('div.q9xVd');
    const homeButton = await homeDiv.$('a');
    await homeButton.click();

    await page.waitForSelector('.aOOlW.HoLwm', {visible : true});
    const notNowButton = await page.$('button.aOOlW.HoLwm');
    await notNowButton.click();
    
    if(activeStoriesUserInfo.data.length === 0 || activeStoriesUserInfo.data[0].items === undefined)
        return [null, null, null, null];
    
    await page.waitForSelector('._6q-tv', {visible : true});
    const img = await page.$('img._6q-tv');
    await img.click();
    
    return [page, browser, activeStoriesUserInfo, unseenStoriesData];
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