// This JavaScript controls the logic for the popup.html.
// It handles toggling the Privacy Shield on/off and saving its state.
console.log("Popup script: popup.js loaded.");

document.addEventListener('DOMContentLoaded', () => {
    console.log("Popup script: DOMContentLoaded event fired.");
    const shieldToggle = document.getElementById('shieldToggle');
    const statusMessage = document.getElementById('status-message');

    // Load saved state
    console.log("Popup script: Attempting to load shield state from storage...");
    chrome.storage.local.get('isShieldEnabled', (data) => {
        const isEnabled = data.isShieldEnabled !== false; // Default to true if not set
        shieldToggle.checked = isEnabled;
        updateStatusMessage(isEnabled);
        console.log(`Popup script: Shield state loaded. isShieldEnabled: ${isEnabled}`);
    });

    // Listen for toggle changes
    shieldToggle.addEventListener('change', () => {
        const isEnabled = shieldToggle.checked;
        console.log(`Popup script: Toggle changed. New state: ${isEnabled}. Saving to storage...`);
        chrome.storage.local.set({ 'isShieldEnabled': isEnabled }, () => {
            updateStatusMessage(isEnabled);
            console.log("Popup script: State saved to storage. Sending message to content script...");
            // Send message to content script to update its state
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    console.log(`Popup script: Sending message to tabId ${tabs[0].id} to toggle shield.`);
                    chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_SHIELD", isEnabled: isEnabled });
                } else {
                    console.warn("Popup script: No active tab found to send message to.");
                }
            });
        });
    });

    function updateStatusMessage(isEnabled) {
        const message = isEnabled ? "Privacy Shield is ON." : "Privacy Shield is OFF.";
        statusMessage.textContent = message;
        console.log(`Popup script: Status message updated to: "${message}"`);
    }
});