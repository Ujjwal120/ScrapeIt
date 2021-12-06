
/**
 * @param  {Page} page
 * @param  {} unseenStoriesData
 * @param  {} MonitorRequests
 */
module.exports.networkInterceptor = async(page, unseenStoriesData, MonitorRequests) => {

    await page.setRequestInterception(true);

    page.on('request', request => {

        if (MonitorRequests.resourceType.includes(request.resourceType())) {
            MonitorRequests.pendingRequests.add(request);
            MonitorRequests.promises.push(
                new Promise(resolve => {
                    request.resolver = resolve;
                }),
            );
        }

        return Promise.resolve().then(() => request.continue()).catch(e => {});
    });

    page.on('requestfinished', async (request) => {

        if (MonitorRequests.resourceType.includes( request.resourceType())) {
            MonitorRequests.pendingRequests.delete(request);
            if (request.resolver) {
                request.resolver();
                delete request.resolver;
            }
        }

        const response = await request.response();

        // this is required for saving contents of first story
        if(request.resourceType() === 'xhr' && 
            request.url().includes("reels_tray/")) {
            
            const data = await response.json();
            unseenStoriesData.users.push(data.tray[0].user);    
            unseenStoriesData.data = [...unseenStoriesData.data, ...data.tray[0].items];
        }

        // this does the job to get unseen stories only, 
        // as Intsagram uses pagination to fetch next group
        // of stories
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

        if(request.resourceType() === 'xhr' && 
            request.url().includes("login/ajax")) {
            
            const data = await response.json().catch((e) => {});
            
            if(data !== undefined && !data.authenticated) {
                MonitorRequests.loginSuccess = false;
            }
        }
    });

    page.on('requestfailed', (request) => {
        // handle failed request
        if (MonitorRequests.resourceType.includes(request.resourceType())) {
            MonitorRequests.pendingRequests.delete(request);
            if (request.resolver) {
                request.resolver();
                delete request.resolver;
            }
        }
    });

}