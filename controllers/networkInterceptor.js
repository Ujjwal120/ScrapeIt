/**
 * @param  {Page} page
 * @param  {Array} results
 */
module.exports.networkInterceptor = async(page, results) => {
    console.log("CALLED");

    await page.setRequestInterception(true);

    page.on('request', request => {
        request.continue();
    });

    page.on('requestfinished', async (request) => {
        const response = await request.response();

        if(request.url().includes("reels_tray") && request.resourceType() === 'xhr') {
            const data = await response.json();
            if(data.tray !== undefined) {
                results.data = data.tray;
            }
        }
    });

    page.on('requestfailed', (request) => {
        // handle failed request
        console.log(request.url(), ' Request Failed !');
    });

}