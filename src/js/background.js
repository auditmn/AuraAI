// This service worker runs in the background and listens for messages or events.
// It's used here to inject the content script when a tab is updated or activated,
// ensuring the shield is active on relevant pages.
console.log("Background script: background.js loaded.");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log(`Background script: Tab updated event. tabId: ${tabId}, changeInfo.status: ${changeInfo.status}, tab.url: ${tab.url}`);
    if (changeInfo.status === 'complete' && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        console.log(`Background script: Tab ${tabId} completed loading. Attempting to inject content.js.`);
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['src/js/content.js']
        }).then(() => {
            console.log(`Background script: content.js successfully injected into tab ${tabId}.`);
        }).catch(err => console.error("Background script: Failed to inject content script:", err));
    }
});

chrome.tabs.onActivated.addListener(activeInfo => {
    console.log(`Background script: Tab activated event. tabId: ${activeInfo.tabId}`);
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
            console.log(`Background script: Tab ${tab.id} activated. Attempting to inject content.js.`);
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['src/js/content.js']
            }).then(() => {
                console.log(`Background script: content.js successfully injected into activated tab ${tab.id}.`);
            }).catch(err => console.error("Background script: Failed to inject content script on activation:", err));
        } else {
            console.log(`Background script: Not injecting content.js for tab ${tab.id} (non-http/https URL or no URL).`);
        }
    });
});