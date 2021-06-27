/**
 * @param  {Page} page
 * @param  {Array} activeStoriesUserInfo
 */
module.exports.networkInterceptor = async(page, unseenStoriesData) => {

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
            if(data.tray[0].items !== undefined && 
                data.tray[0].seen === 0) 
                
                unseenStoriesData.users.push(data.tray[0].user);
                unseenStoriesData.data = [...unseenStoriesData.data, ...data.tray[0].items];
        }

        if(request.resourceType() === 'xhr' && 
            request.url().includes("reel_ids")) {
            
            const data = await response.json();
            for(let i = 0; i < data.reels_media.length; i++) {
                unseenStoriesData.users.push(data.reels_media[i].user);
                for(j = 0; j < data.reels_media[i].items.length; j++) {
                    unseenStoriesData.data.push(data.reels_media[i].items[j]);
                }
            }
        }
    });

    page.on('requestfailed', (request) => {
        // handle failed request
        console.log(request.url().substr(0, 20), ' Request Failed !');
    });

}