// API interaction module
const API = {
    BASE_URL: 'http://0.0.0.0:8000',
    sessionId: null,

    async createSession(userId = 'user') {
        try {
            const sessionId = this.generateUUID();
            const response = await fetch(`${this.BASE_URL}/apps/rag_agent/users/${userId}/sessions/${sessionId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to create session');
            }

            this.sessionId = sessionId;
            console.log('Session created:', sessionId);
            return sessionId;
        } catch (error) {
            console.error('Session creation error:', error);
            throw error;
        }
    },

    async sendMessage(text, context = [], files = []) {
        if (!this.sessionId) {
            throw new Error('No active session');
        }

        // Build message parts array
        const messageParts = [];

        // Build message text with context
        let messageText = text;
        if (context.length > 0) {
            messageText += '\n\n[Context - Selected Products]:\n';
            context.forEach((product, index) => {
                messageText += `\nProduct ${index + 1}:\n`;
                messageText += `- Name: ${product.name}\n`;
                messageText += `- Price: ${product.discountedPrice || product.price}\n`;
                if (product.brand) messageText += `- Brand: ${product.brand}\n`;
                if (product.description) messageText += `- Description: ${product.description}\n`;
            });
        }

        // Add text part
        messageParts.push({ text: messageText });

        // Add file parts
        for (const file of files) {
            try {
                const base64Data = await this.fileToBase64(file);
                const mimeType = file.type || this.getMimeType(file.name);
                
                messageParts.push({
                    inlineData: {
                        displayName: file.name,
                        data: base64Data,
                        mimeType: mimeType
                    }
                });
                
                console.log(`Added file: ${file.name} (${mimeType}) - ${(base64Data.length / 1024).toFixed(2)}KB`);
            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
                throw new Error(`Failed to process file: ${file.name}`);
            }
        }

        const payload = {
            appName: 'rag_agent',
            userId: 'user',
            sessionId: this.sessionId,
            newMessage: {
                role: 'user',
                parts: messageParts
            },
            streaming: false
        };

        console.log('Sending payload with parts:', messageParts.length);

        const response = await fetch(`${this.BASE_URL}/run_sse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        return response.body.getReader();
    },

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    getMimeType(filename) {
        const ext = filename.toLowerCase().split('.').pop();
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'txt': 'text/plain',
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'json': 'application/json',
            'csv': 'text/csv'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    },

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'text/plain', 'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (file.size > maxSize) {
            throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
        }

        const mimeType = file.type || this.getMimeType(file.name);
        if (!allowedTypes.includes(mimeType)) {
            throw new Error(`File type ${mimeType} is not supported.`);
        }

        return true;
    },

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};
