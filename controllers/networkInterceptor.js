/**
 * @param  {Page} page
 * @param  {Array} activeStoriesUserInfo
 */
module.exports.networkInterceptor = async(page, activeStoriesUserInfo) => {

    await page.setRequestInterception(true);

    page.on('request', request => {
        return Promise.resolve().then(() => request.continue()).catch(e => {});
    });

    page.on('requestfinished', async (request) => {
        const response = await request.response();

        // this is required for saving contents of first story
        if(request.resourceType() === 'xhr' && 
            request.url().includes("reels_tray") && 
            !request.url().includes("reels_tray_broadcast")) {
            const data = await response.json();
            if(data.tray !== undefined) {
                activeStoriesUserInfo.data = [...activeStoriesUserInfo.data, ...data.tray];
            }
        }

        if(request.resourceType() === 'xhr' && request.url().includes("reel_ids")) {
            const data = await response.json();
            console.log(data.reels_media);
        }
    });

    page.on('requestfailed', (request) => {
        // handle failed request
        console.log(request.url(), ' Request Failed !');
    });

}