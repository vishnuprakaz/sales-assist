// Main Application - App initialization and form submission
let isProcessing = false;

// Initialize the app
async function initApp() {
    UI.init();

    // Create session on startup
    try {
        await API.createSession();
        console.log('Session initialized successfully');
    } catch (error) {
        console.error('Failed to initialize session:', error);
        UI.addMessage('assistant', 'Failed to connect to the server. Please refresh the page.');
    }

    // Handle form submission
    const form = document.getElementById('messageForm');
    const input = document.getElementById('messageInput');
    const button = document.getElementById('sendButton');
    const attachButton = document.getElementById('attachButton');
    const fileInput = document.getElementById('fileInput');

    // Handle file attachment
    attachButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFileSelection(files);
        // Clear the input so the same file can be selected again
        e.target.value = '';
    });

    // Handle drag and drop
    setupDragAndDrop(form);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const text = input.value.trim();
        if ((!text && attachedFiles.length === 0) || isProcessing) return;

        // Add processing state - transform to circular loader
        form.classList.add('processing');
        
        // Disable input
        isProcessing = true;
        input.disabled = true;
        button.disabled = true;

        // Get selected products context BEFORE clearing anything
        const context = UI.getSelectedProductsContext();
        console.log('[SUBMIT] Selected products count:', UI.selectedProducts.length);
        console.log('[SUBMIT] Context to send:', context);
        console.log('[SUBMIT] Files to send:', attachedFiles.length);
        
        // Add user message (with context and file indicators)
        let displayMessage = text || 'Attached files';
        if (context.length > 0) {
            displayMessage += ` [${context.length} product${context.length > 1 ? 's' : ''} selected]`;
        }
        if (attachedFiles.length > 0) {
            displayMessage += ` [${attachedFiles.length} file${attachedFiles.length > 1 ? 's' : ''} attached]`;
        }
        UI.addMessage('user', displayMessage, attachedFiles);
        
        try {
            // Get stream reader with context and files
            console.log('[SUBMIT] Sending message with context:', context.length, 'products and', attachedFiles.length, 'files');
            const reader = await API.sendMessage(text, context, attachedFiles);

            // Create streaming message container
            currentStreamingMessage = UI.addStreamingMessage('assistant');
            streamBuffer = '';

            // Clear input, selected products, and files after successful send (with delay for UX)
            setTimeout(() => {
                input.value = '';
                UI.selectedProducts = [];
                UI.updateContextChips();
                clearAttachedFiles();
            }, 500);

            // Process the stream (pass form reference)
            await processStream(reader, form);

        } catch (error) {
            console.error('Error sending message:', error);
            UI.addMessage('assistant', 'Sorry, I encountered an error processing your request.');
            // Remove processing state on error
            form.classList.remove('processing');
        } finally {
            // Re-enable input (processing state removed after render completes)
            isProcessing = false;
            input.disabled = false;
            button.disabled = false;
            input.focus();
        }
    });
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

