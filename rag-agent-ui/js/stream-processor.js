// Stream Processor Module - SSE stream processing logic
let currentStreamingMessage = null;
let streamBuffer = '';

// Process SSE stream
async function processStream(reader, formElement) {
    const decoder = new TextDecoder();
    let buffer = '';
    let currentTextContent = '';
    let displayedText = ''; // Text extracted from <text> tags for display
    let hasSeenFunctionCall = false;
    let hasSeenFunctionResponse = false;
    let fullMessageContent = '';

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                console.log('Stream complete');
                break;
            }

            // Decode the chunk
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            console.log('[STREAM] Received chunk, buffer length:', buffer.length);

            // Process complete SSE events (lines ending with \n\n)
            const events = buffer.split('\n\n');
            buffer = events.pop() || ''; // Keep incomplete event in buffer

            console.log('[STREAM] Processing', events.length, 'events');

            for (const event of events) {
                if (!event.trim()) continue;

                // Parse SSE event
                const lines = event.split('\n');
                let eventType = 'message'; // Default type
                let eventData = '';

                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        eventType = line.substring(6).trim();
                    } else if (line.startsWith('data:')) {
                        eventData += line.substring(5).trim();
                    }
                }

                console.log('[SSE Event]', eventType, 'Data preview:', eventData.substring(0, 150));

                // If no explicit event type, try to parse the data
                if (eventType === 'message' && eventData) {
                    try {
                        const parsed = JSON.parse(eventData);
                        console.log('[SSE] Parsed data keys:', Object.keys(parsed));
                    } catch (e) {
                        // Not JSON, that's ok
                    }
                }

                // Handle different event types
                switch (eventType) {
                    case 'text_chunk':
                    case 'text-chunk':
                        // Streaming text content
                        if (eventData) {
                            try {
                                const data = JSON.parse(eventData);
                                const textChunk = data.text || data.content || '';
                                
                                if (textChunk) {
                                    currentTextContent += textChunk;
                                    fullMessageContent += textChunk;
                                    UI.updateStreamingText(currentStreamingMessage, currentTextContent);
                                }
                            } catch (e) {
                                console.error('Error parsing text_chunk:', e);
                                // Try treating it as raw text
                                currentTextContent += eventData;
                                fullMessageContent += eventData;
                                UI.updateStreamingText(currentStreamingMessage, currentTextContent);
                            }
                        }
                        break;

                    case 'content_delta':
                    case 'delta':
                        // Alternative streaming format
                        if (eventData) {
                            try {
                                const data = JSON.parse(eventData);
                                const textChunk = data.delta || data.text || data.content || '';
                                
                                if (textChunk) {
                                    currentTextContent += textChunk;
                                    fullMessageContent += textChunk;
                                    UI.updateStreamingText(currentStreamingMessage, currentTextContent);
                                }
                            } catch (e) {
                                console.error('Error parsing delta:', e);
                            }
                        }
                        break;

                    case 'function_call':
                    case 'tool_call':
                        // Function call started
                        hasSeenFunctionCall = true;
                        try {
                            const data = JSON.parse(eventData);
                            console.log('Function call:', data);
                            UI.showFunctionCallLoader(currentStreamingMessage, data.name || data.function_name, data.args || data.arguments);
                        } catch (e) {
                            console.error('Error parsing function_call:', e);
                        }
                        break;

                    case 'function_response':
                    case 'tool_response':
                        // Function response received
                        hasSeenFunctionResponse = true;
                        try {
                            const data = JSON.parse(eventData);
                            console.log('Function response received');
                            UI.showFunctionResponseLoader(currentStreamingMessage);
                        } catch (e) {
                            console.error('Error parsing function_response:', e);
                        }
                        break;

                    case 'message':
                    case 'response':
                        // Full message update (Google ADK format)
                        if (eventData) {
                            try {
                                const data = JSON.parse(eventData);
                                
                                // Check if this is a thinking event (has thoughtSignature)
                                const isThinkingEvent = data.content?.parts?.[0]?.thoughtSignature;
                                
                                // Handle Google ADK format: content.parts[{text: "..."}]
                                let content = '';
                                if (data.content && data.content.parts && Array.isArray(data.content.parts)) {
                                    // Extract text from all parts
                                    content = data.content.parts
                                        .filter(part => part.text)
                                        .map(part => part.text)
                                        .join('');
                                } else if (data.content) {
                                    content = typeof data.content === 'string' ? data.content : '';
                                } else if (data.text) {
                                    content = data.text;
                                } else if (data.message) {
                                    content = data.message;
                                }
                                
                                if (content) {
                                    fullMessageContent = content;
                                    
                                    // If this is a thinking event, show with grey styling
                                    if (isThinkingEvent) {
                                        console.log('[THINKING] Displaying thinking content in grey');
                                        UI.updateThinkingText(currentStreamingMessage, content);
                                    } else {
                                        // Extract ALL text from <text> tags (there may be multiple)
                                        const textMatches = content.match(/<text>([\s\S]*?)<\/text>/g);
                                        if (textMatches) {
                                            // Extract and join all text content
                                            const extractedTexts = textMatches.map(match => {
                                                const textContent = match.replace(/<\/?text>/g, '').trim();
                                                return textContent;
                                            }).filter(t => t.length > 0);
                                            
                                            const newDisplayedText = extractedTexts.join('\n\n');
                                            
                                            // Only update if text has changed
                                            if (newDisplayedText !== displayedText) {
                                                displayedText = newDisplayedText;
                                                console.log('[MESSAGE] Displaying text:', displayedText.substring(0, 100));
                                                UI.updateStreamingText(currentStreamingMessage, displayedText);
                                            }
                                        } else if (!hasSeenFunctionCall) {
                                            // Show raw content if no structured tags and not function-related
                                            UI.updateStreamingText(currentStreamingMessage, content);
                                        }
                                    }
                                }
                            } catch (e) {
                                console.error('Error parsing message:', e, eventData.substring(0, 200));
                            }
                        }
                        break;

                    case 'complete':
                    case 'done':
                    case 'end':
                        // Stream complete - finalize the message
                        console.log('[COMPLETE] Finalizing message...');
                        
                        // Use the accumulated full message content
                        const finalContent = fullMessageContent;
                        console.log('[COMPLETE] Final content length:', finalContent.length);
                        
                        // Get the content div
                        const contentDiv = currentStreamingMessage.querySelector('.streaming-content, .message-content');
                        if (contentDiv) {
                            // Clear any loaders and streaming content
                            contentDiv.innerHTML = '';
                            
                            // Parse content in order to maintain structure
                            UI.renderOrderedContent(contentDiv, finalContent);
                            
                            // Update classes
                            contentDiv.classList.remove('streaming-content');
                            contentDiv.classList.add('message-content');
                        }
                        
                        // Remove streaming class from message
                        currentStreamingMessage.classList.remove('streaming');
                        UI.scrollToBottom();
                        break;

                    case 'error':
                        console.error('Stream error:', eventData);
                        UI.addMessage('assistant', 'Sorry, an error occurred while processing your request.');
                        break;

                    default:
                        console.log('Unknown event type:', eventType, 'data:', eventData.substring(0, 100));
                }
            }
        }

        // After stream ends, finalize with accumulated content
        console.log('[STREAM END] Finalizing with accumulated content');
        await finalizeWithCurrentContent();

    } catch (error) {
        console.error('Stream processing error:', error);
        if (currentStreamingMessage) {
            await finalizeWithCurrentContent();
        }
    }

    async function finalizeWithCurrentContent() {
        console.log('[FINALIZE] Starting - content length:', fullMessageContent.length);
        const finalContent = fullMessageContent;
        
        const contentDiv = currentStreamingMessage?.querySelector('.streaming-content, .message-content');
        if (contentDiv && finalContent) {
            console.log('[FINALIZE] Clearing content div and rendering...');
            contentDiv.innerHTML = '';
            
            // MUST await this!
            await UI.renderOrderedContent(contentDiv, finalContent);
            
            console.log('[FINALIZE] ✅ Rendering complete, stopping loader');
            if (formElement) {
                formElement.classList.remove('processing');
            }
            
            contentDiv.classList.remove('streaming-content');
            contentDiv.classList.add('message-content');
            
            if (currentStreamingMessage) {
                currentStreamingMessage.classList.remove('streaming');
            }
            UI.scrollToBottom();
        } else {
            console.log('[FINALIZE] No content div or content, stopping loader anyway');
            if (formElement) {
                formElement.classList.remove('processing');
            }
        }
    }
}

