// This script is injected into every web page and contains the core PII redaction logic.
// It listens for user input and redacts sensitive data in real-time.
console.log("Content script: content.js loaded on page:", window.location.href);

// Define the redaction algorithm
const redactPII = (text) => {
    console.log("Content script: redactPII function called with text:", text);
    if (!text) {
        console.log("Content script: Input text is empty, returning as is.");
        return text;
    }

    let redactedText = text;
    let piiFound = false;

    // --- 1. Structured PII Redaction (High Precision Regex) ---

    // Email Addresses: [EMAIL_ADDRESS]
    const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi;
    if (redactedText.match(emailRegex)) {
        console.log("Content script: Email found.");
        piiFound = true;
    }
    redactedText = redactedText.replace(emailRegex, '[EMAIL_ADDRESS]');

    // Phone Numbers (common formats): [PHONE_NUMBER]
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
    if (redactedText.match(phoneRegex)) {
        console.log("Content script: Phone number found.");
        piiFound = true;
    }
    redactedText = redactedText.replace(phoneRegex, '[PHONE_NUMBER]');

    // Credit Card Numbers (16 digits, with optional spaces/hyphens): [CREDIT_CARD_NUMBER]
    const ccRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
    if (redactedText.match(ccRegex)) {
        console.log("Content script: Credit card number found.");
        piiFound = true;
    }
    redactedText = redactedText.replace(ccRegex, '[CREDIT_CARD_NUMBER]');

    // Social Security Numbers (US format: XXX-XX-XXXX): [NATIONAL_ID]
    const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
    if (redactedText.match(ssnRegex)) {
        console.log("Content script: SSN found.");
        piiFound = true;
    }
    redactedText = redactedText.replace(ssnRegex, '[NATIONAL_ID]');

    // URLs (basic detection): [URL]
    const urlRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)\b/gi;
    if (redactedText.match(urlRegex)) {
        console.log("Content script: URL found.");
        piiFound = true;
    }
    redactedText = redactedText.replace(urlRegex, '[URL]');

    // --- 2. Lightweight Unstructured PII Redaction (Contextual/Keyword-based) ---

    // Names (following "my name is"): [PERSON_NAME]
    const nameContextRegex = /(my name is\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
    if (redactedText.match(nameContextRegex)) {
        console.log("Content script: Name (contextual) found.");
        piiFound = true;
    }
    redactedText = redactedText.replace(nameContextRegex, '$1[PERSON_NAME]');

    // Addresses (following "my address is" or common address components): [ADDRESS]
    const addressContextRegex = /(my address is\s+)(\d+\s+[A-Za-z\s]+(?:Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Square|Sq|Terrace|Ter|Way|Wy)\.?,?\s*[A-Za-z\s]+,?\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?)/g;
    if (redactedText.match(addressContextRegex)) {
        console.log("Content script: Address (contextual) found.");
        piiFound = true;
    }
    redactedText = redactedText.replace(addressContextRegex, '$1[ADDRESS]');

    const standaloneAddressRegex = /\b\d{1,5}\s+[A-Za-z\s]{3,}(?:Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Square|Sq|Terrace|Ter|Way|Wy)\.?,?\s*[A-Za-z\s]+,?\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/g;
    if (redactedText.match(standaloneAddressRegex)) {
        console.log("Content script: Standalone address pattern found.");
        piiFound = true;
    }
    redactedText = redactedText.replace(standaloneAddressRegex, '[ADDRESS]');

    console.log(`Content script: Redaction complete. PII found: ${piiFound}. Redacted text:`, redactedText);
    return redactedText;
};

// Global flag to control the shield's active state
let isShieldEnabled = true;
console.log("Content script: Initial isShieldEnabled set to true.");

// Function to apply redaction to an input element
const applyRedaction = (element) => {
    console.log("Content script: applyRedaction called for element:", element);

    // If shield is disabled, restore original text if available (from a temporary attribute)
    if (!isShieldEnabled) {
        console.log("Content script: Shield is disabled. Checking for original value to restore.");
        if (element.dataset.originalValue) {
            element.value = element.dataset.originalValue;
            delete element.dataset.originalValue;
            console.log("Content script: Original value restored.");
        } else {
            console.log("Content script: No original value found to restore or element value already original.");
        }
        return;
    }

    // Store original value before redacting if not already stored
    if (!element.dataset.originalValue) {
        element.dataset.originalValue = element.value;
        console.log("Content script: Original value stored:", element.dataset.originalValue);
    }

    const originalText = element.dataset.originalValue; // Always use the stored original value
    const redactedText = redactPII(originalText);

    if (element.value !== redactedText) {
        element.value = redactedText;
        console.log("Content script: Element value updated with redacted text.");
    } else {
        console.log("Content script: Element value already matches redacted text, no update needed.");
    }
};

// Function to handle input events on text areas and input fields
const handleInput = (event) => {
    console.log("Content script: Input event detected on element:", event.target);
    const element = event.target;
    if (element.tagName === 'TEXTAREA' || (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search'))) {
        console.log("Content script: Element is a valid input type. Applying redaction.");
        applyRedaction(element);
    } else {
        console.log("Content script: Element is not a valid input type for redaction.");
    }
};

// Function to observe changes in the DOM and apply redaction to new/modified input fields
const observeDOMChanges = () => {
    console.log("Content script: Starting DOM mutation observer.");
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node itself is an input/textarea
                        if (node.tagName === 'TEXTAREA' || (node.tagName === 'INPUT' && (node.type === 'text' || node.type === 'search'))) {
                            console.log("Content script: Directly added input/textarea found:", node);
                            applyRedaction(node);
                        }
                        // Check for input/textarea elements within the added node's subtree
                        const inputElements = node.querySelectorAll('textarea, input[type="text"], input[type="search"]');
                        if (inputElements.length > 0) {
                            console.log("Content script: Input/textarea elements found within added subtree:", inputElements);
                            inputElements.forEach(applyRedaction);
                        }
                    }
                });
            }
        });
    });

    // Start observing the entire document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    console.log("Content script: DOM observer attached to document.body.");
};

// Initial scan and event listeners for existing input fields
const initializeShield = () => {
    console.log("Content script: Initializing shield...");
    // Get initial state from storage
    chrome.storage.local.get('isShieldEnabled', (data) => {
        isShieldEnabled = data.isShieldEnabled !== false; // Default to true if not set
        console.log(`Content script: Initial state from storage: isShieldEnabled = ${isShieldEnabled}`);

        // Apply redaction to all existing input fields on page load
        const allInputElements = document.querySelectorAll('textarea, input[type="text"], input[type="search"]');
        console.log(`Content script: Found ${allInputElements.length} existing input/textarea elements.`);
        allInputElements.forEach(applyRedaction);

        // Add event listeners for future input
        console.log("Content script: Adding 'input' and 'change' event listeners.");
        document.addEventListener('input', handleInput, true); // Use capture phase to ensure it runs early
        document.addEventListener('change', handleInput, true); // For changes that don't trigger 'input'

        // Start observing DOM for dynamically added input fields
        observeDOMChanges();
        console.log("Content script: Shield initialization complete.");
    });
};

// Listen for messages from the popup to toggle the shield
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Content script: Message received from runtime:", request);
    if (request.type === "TOGGLE_SHIELD") {
        isShieldEnabled = request.isEnabled;
        console.log(`Content script: Shield toggled via message. New state: ${isShieldEnabled}.`);
        // Re-apply redaction/restore original to all relevant elements on the page
        const allInputElements = document.querySelectorAll('textarea, input[type="text"], input[type="search"]');
        console.log(`Content script: Re-applying redaction/restore to ${allInputElements.length} elements.`);
        allInputElements.forEach(applyRedaction); // This will either redact or restore based on isShieldEnabled
    }
});

// Run initialization when the DOM is fully loaded
if (document.readyState === 'loading') {
    console.log("Content script: DOM not yet loaded. Waiting for DOMContentLoaded.");
    document.addEventListener('DOMContentLoaded', initializeShield);
} else {
    console.log("Content script: DOM already loaded. Initializing shield immediately.");
    initializeShield();
}

