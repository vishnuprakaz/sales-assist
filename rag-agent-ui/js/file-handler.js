// File Handler Module - File selection, validation, and drag & drop
let attachedFiles = [];

function handleFileSelection(files) {
    for (const file of files) {
        try {
            // Debug API object
            console.log('API object:', API);
            console.log('API.validateFile exists:', typeof API?.validateFile);
            
            // Validate file (use API if available, otherwise local)
            if (typeof API?.validateFile === 'function') {
                API.validateFile(file);
            } else {
                validateFile(file);
            }
            
            // Check if file already attached
            if (!attachedFiles.find(f => f.name === file.name && f.size === file.size)) {
                attachedFiles.push(file);
                console.log(`File attached: ${file.name} (${file.type}) - ${(file.size / 1024).toFixed(2)}KB`);
            }
        } catch (error) {
            console.error('File validation error:', error);
            alert(error.message);
        }
    }
    
    updateFilePreview();
}

function validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'text/plain', 'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
        throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
    }

    const mimeType = file.type;
    if (!allowedTypes.includes(mimeType)) {
        throw new Error(`File type ${mimeType} is not supported.`);
    }

    return true;
}

function removeAttachedFile(index) {
    if (index >= 0 && index < attachedFiles.length) {
        const removedFile = attachedFiles.splice(index, 1)[0];
        console.log(`File removed: ${removedFile.name}`);
        updateFilePreview();
    }
}

function clearAttachedFiles() {
    attachedFiles = [];
    updateFilePreview();
}

function updateFilePreview() {
    const container = document.getElementById('filePreviewContainer');
    
    if (attachedFiles.length === 0) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = '';
    
    attachedFiles.forEach((file, index) => {
        const isImage = file.type.startsWith('image/');
        const fileSize = (file.size / 1024).toFixed(1);
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'file-preview-item';
        itemDiv.setAttribute('data-index', index);
        
        if (isImage) {
            // Create image preview
            const imageUrl = URL.createObjectURL(file);
            itemDiv.innerHTML = `
                <div class="file-preview-image">
                    <img src="${imageUrl}" alt="${file.name}" class="preview-thumbnail">
                    <div class="file-overlay">
                        <div class="file-name" title="${file.name}">${file.name}</div>
                        <div class="file-size">${fileSize}KB</div>
                    </div>
                </div>
                <button class="file-remove" onclick="removeAttachedFile(${index})" title="Remove file">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
        } else {
            // Create file icon preview
            itemDiv.innerHTML = `
                <div class="file-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                </div>
                <div class="file-info">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-size">${fileSize}KB</div>
                </div>
                <button class="file-remove" onclick="removeAttachedFile(${index})" title="Remove file">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
        }
        
        container.appendChild(itemDiv);
    });
}

function setupDragAndDrop(form) {
    const dropZone = form;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropZone.classList.add('drag-over');
    }
    
    function unhighlight() {
        dropZone.classList.remove('drag-over');
    }
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const files = Array.from(e.dataTransfer.files);
        handleFileSelection(files);
    }
}

