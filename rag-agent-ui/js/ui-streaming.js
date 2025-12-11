// UI Streaming Module - Streaming updates, loaders, and animations
Object.assign(UI, {
  addStreamingMessage(role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role} streaming`;

    const header = document.createElement('div');
    header.className = 'message-header';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = role === 'user'
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';

    const roleLabel = document.createElement('span');
    roleLabel.className = 'message-role';
    roleLabel.textContent = role === 'user' ? 'You' : 'ShopAssist';

    header.appendChild(avatar);
    header.appendChild(roleLabel);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'streaming-content';
    contentDiv.style.paddingLeft = '36px';
    contentDiv.innerHTML = `
      <div class="thinking-loader">
        <div class="thinking-dots">
          <span class="thinking-dot"></span>
          <span class="thinking-dot"></span>
          <span class="thinking-dot"></span>
        </div>
      </div>
    `;

    messageDiv.appendChild(header);
    messageDiv.appendChild(contentDiv);
    this.chatContainer.appendChild(messageDiv);

    this.scrollToBottom();
    return messageDiv;
  },

  // NEW: Update streaming text only (for direct text streaming)
  updateStreamingText(messageElement, text) {
    console.log('[UI] updateStreamingText called, text length:', text ? text.length : 0);
    
    if (!messageElement) {
      console.warn('[UI] No messageElement');
      return;
    }

    const contentDiv = messageElement.querySelector('.streaming-content');
    if (!contentDiv) {
      console.warn('[UI] No contentDiv found');
      return;
    }

    // Clear any thinking content first
    this.clearThinkingContent(messageElement);
    
    // Remove thinking loader if present
    const thinkingLoader = contentDiv.querySelector('.thinking-loader');
    if (thinkingLoader) {
      thinkingLoader.remove();
    }

    // Clean up and format for display
    const displayText = text.trim();
    console.log('[UI] Display text preview:', displayText.substring(0, 100));

    // Only show content if we have meaningful text content
    if (displayText && displayText.length > 0) {
      // Check if text container exists
      let textContainer = contentDiv.querySelector('.streaming-text-content');
      
      if (!textContainer) {
        // Create new text container with fade-in
        textContainer = document.createElement('div');
        textContainer.className = 'streaming-text-content';
        contentDiv.appendChild(textContainer);
      }
      
      // Store previous text length to detect new content
      if (!textContainer.dataset.prevLength) {
        textContainer.dataset.prevLength = '0';
      }
      
      const prevLength = parseInt(textContainer.dataset.prevLength);
      const newContent = displayText.substring(prevLength);
      
      // If there's new content, add it with animation
      if (newContent.length > 0) {
        // Apply basic markdown formatting
        const formattedText = this.formatMarkdownForStreaming(displayText);
        
        // Split into words for smooth word-by-word animation
        const words = formattedText.split(' ');
        const prevWords = textContainer.dataset.prevText ? textContainer.dataset.prevText.split(' ').length : 0;
        
        // Build HTML with animated new words
        let html = '';
        words.forEach((word, index) => {
          if (index < prevWords) {
            // Existing word - no animation
            html += word + ' ';
      } else {
            // New word - add with fade animation
            html += `<span class="word-fade-in" style="animation-delay: ${(index - prevWords) * 0.03}s">${word}</span> `;
          }
        });
        
        textContainer.innerHTML = html + '<span class="streaming-cursor">|</span>';
        textContainer.dataset.prevLength = displayText.length.toString();
        textContainer.dataset.prevText = formattedText;
      }
      
      console.log('[UI] Content updated');
    }

    this.scrollToBottom();
  },

  // NEW: Update streaming text part (before or after products)
  updateStreamingTextPart(messageElement, text, isAfterProducts = false) {
    if (!messageElement) return;

    const contentDiv = messageElement.querySelector('.streaming-content, .message-content');
    if (!contentDiv) return;

    const displayText = text.trim();
    if (!displayText || displayText.length === 0) return;

    // Apply markdown formatting
    const formattedText = this.formatMarkdownForStreaming(displayText);

    if (isAfterProducts) {
      // This is text AFTER products
      // Find or create the "after" text container
      let afterContainer = contentDiv.querySelector('.streaming-text-after');

      if (!afterContainer) {
        afterContainer = document.createElement('div');
        afterContainer.className = 'streaming-text-content streaming-text-after';
        contentDiv.appendChild(afterContainer);
      }

      afterContainer.innerHTML = `${formattedText}<span class="streaming-cursor">|</span>`;
    } else {
      // This is text BEFORE products  
      // Find or create the "before" text container
      let beforeContainer = contentDiv.querySelector('.streaming-text-before');

      if (!beforeContainer) {
        beforeContainer = document.createElement('div');
        beforeContainer.className = 'streaming-text-content streaming-text-before';

        // Insert at the beginning
        if (contentDiv.firstChild) {
          contentDiv.insertBefore(beforeContainer, contentDiv.firstChild);
        } else {
          contentDiv.appendChild(beforeContainer);
        }
      }

      beforeContainer.innerHTML = `${formattedText}<span class="streaming-cursor">|</span>`;
    }

    this.scrollToBottom();
  },

  // Format markdown for streaming display (simplified, real-time)
  formatMarkdownForStreaming(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
      .replace(/\n\n/g, '</p><p>')  // Paragraph breaks
      .replace(/\n/g, '<br>');  // Line breaks
  },

  // LEGACY: Keep for backward compatibility
  updateStreamingMessage(messageElement, content) {
    // Use the new method
    this.updateStreamingText(messageElement, content);
  },

  // NEW: Finalize streaming text (no re-parsing needed)
  finalizeStreamingText(messageElement, finalText) {
    if (!messageElement) return;

    const contentDiv = messageElement.querySelector('.streaming-content');
    if (!contentDiv) return;

    // Check if we have a text container
    const textContainer = contentDiv.querySelector('.streaming-text-content');

    if (textContainer) {
      // Remove streaming cursor
      const currentHtml = textContainer.innerHTML;
      textContainer.innerHTML = currentHtml.replace(/<span class="streaming-cursor">.*?<\/span>/g, '');
    }

    // Remove streaming class from message
    messageElement.classList.remove('streaming');
    contentDiv.classList.remove('streaming-content');
    contentDiv.classList.add('message-content');

    this.scrollToBottom();
  },

  // LEGACY: Keep for backward compatibility
  finalizeStreamingMessage(messageElement, content) {
    if (!messageElement) return;

    // Parse final content for products (old behavior)
    const { text, products } = this.parseMessageContent(content);

    const contentDiv = messageElement.querySelector('.streaming-content');
    if (contentDiv) {
      contentDiv.className = 'message-content'; // Remove streaming class
      contentDiv.innerHTML = this.formatText(text);
    }

    // Remove streaming class from message
    messageElement.classList.remove('streaming');

    // Add products if present
    if (products && products.length > 0) {
      console.log('Adding product grid with', products.length, 'products');
      this.addProductGrid(products);
    }

    this.scrollToBottom();
  },

  // NEW: Show product skeleton loader
  showProductSkeleton(messageElement) {
    if (!messageElement) return;

    const contentDiv = messageElement.querySelector('.streaming-content');
    if (!contentDiv) return;

    // Create skeleton container
    const skeletonHtml = `
      <div class="product-skeleton-container">
        <div class="skeleton-product-grid">
          <div class="skeleton-product-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-product-info">
              <div class="skeleton-title"></div>
              <div class="skeleton-description"></div>
              <div class="skeleton-price"></div>
            </div>
          </div>
          <div class="skeleton-product-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-product-info">
              <div class="skeleton-title"></div>
              <div class="skeleton-description"></div>
              <div class="skeleton-price"></div>
            </div>
          </div>
          <div class="skeleton-product-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-product-info">
              <div class="skeleton-title"></div>
              <div class="skeleton-description"></div>
              <div class="skeleton-price"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Append skeleton to content (after text content)
    contentDiv.insertAdjacentHTML('beforeend', skeletonHtml);
    this.scrollToBottom();
  },

  // NEW: Replace skeleton with actual products
  replaceSkeletonWithProducts(messageElement, products) {
    console.log('[UI] replaceSkeletonWithProducts called', {
      hasMessageElement: !!messageElement,
      productsCount: products ? products.length : 0
    });

    if (!messageElement || !products) {
      console.warn('[UI] Missing messageElement or products');
      return;
    }

    // Find any content div (streaming or finalized)
    let contentDiv = messageElement.querySelector('.streaming-content, .message-content');

    if (!contentDiv) {
      console.warn('[UI] Content div not found in message element');
      return;
    }

    console.log('[UI] Content div found, class:', contentDiv.className);

    // Remove skeleton if it exists
    const skeleton = contentDiv.querySelector('.product-skeleton-container');
    if (skeleton) {
      skeleton.remove();
      console.log('[UI] Skeleton removed');
    } else {
      console.warn('[UI] No skeleton found to remove');
    }

    // Create product grid
    const gridDiv = document.createElement('div');
    gridDiv.className = 'product-grid-inline';
    gridDiv.style.opacity = '0';
    gridDiv.style.transition = 'opacity 0.3s ease-in';

    console.log('[UI] Creating product cards...');
    products.forEach((product, index) => {
      console.log(`[UI] Creating card ${index + 1}:`, product.name);
      const card = this.createProductCard(product);
      gridDiv.appendChild(card);
    });

    // Append product grid to content div
    contentDiv.appendChild(gridDiv);
    console.log('[UI] Product grid appended to content div');

    // Fade in products
    setTimeout(() => {
      gridDiv.style.opacity = '1';
    }, 50);

    this.scrollToBottom();
  },

  // NEW: Hide product skeleton if parsing failed
  hideProductSkeleton(messageElement) {
    if (!messageElement) return;

    const contentDiv = messageElement.querySelector('.streaming-content');
    if (!contentDiv) return;

    const skeleton = contentDiv.querySelector('.product-skeleton-container');
    if (skeleton) {
      skeleton.remove();
    }
  },

  showFunctionCallLoader(messageElement, functionName, functionArgs) {
    if (!messageElement) return;

    const contentDiv = messageElement.querySelector('.streaming-content');
    if (!contentDiv) return;

    // Generate dynamic loader message based on function call
    let loaderMessage = 'Searching our catalog...';
    let loaderIcon = '🔍';
    let loaderSubtext = 'This might take a moment';

    if (functionName === 'rag_search_agent') {
      const query = functionArgs?.request || '';
      if (query.includes('speaker') || query.includes('audio')) {
        loaderMessage = 'Finding excellent speakers for you';
        loaderIcon = '🔊';
        loaderSubtext = 'Checking audio quality and features...';
      } else if (query.includes('shirt') || query.includes('tshirt') || query.includes('t-shirt')) {
        loaderMessage = 'Finding the best t-shirts for you';
        loaderIcon = '👕';
        loaderSubtext = 'Checking styles, materials and sizes...';
      } else if (query.includes('phone') || query.includes('mobile')) {
        loaderMessage = 'Searching through our phone collection';
        loaderIcon = '📱';
        loaderSubtext = 'Comparing features and prices...';
      } else if (query.includes('shoe') || query.includes('footwear')) {
        loaderMessage = 'Looking for perfect shoes';
        loaderIcon = '👟';
        loaderSubtext = 'Checking comfort and style...';
      } else if (query.includes('laptop') || query.includes('computer')) {
        loaderMessage = 'Scanning our tech collection';
        loaderIcon = '💻';
        loaderSubtext = 'Analyzing specifications...';
      } else {
        loaderMessage = `Searching for ${query}`;
        loaderIcon = '🔍';
        loaderSubtext = 'Finding the best matches...';
      }
    }

    contentDiv.innerHTML = `
      <div class="function-call-loader">
        <div class="loader-header">
          <div class="loader-icon-wrapper">
            <div class="loader-icon">${loaderIcon}</div>
            <div class="loader-spinner"></div>
          </div>
          <div class="loader-content">
            <div class="loader-text"></div>
            <div class="loader-subtext"></div>
          </div>
        </div>
        <div class="loader-progress-container">
          <div class="loader-progress">
            <div class="progress-bar"></div>
          </div>
          <div class="loader-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    `;

    this.scrollToBottom();
  },

  showFunctionResponseLoader(messageElement) {
    if (!messageElement) return;

    const contentDiv = messageElement.querySelector('.streaming-content');
    if (!contentDiv) return;

    contentDiv.innerHTML = `
      <div class="function-response-loader">
        <div class="loader-header">
          <div class="loader-icon-wrapper">
            <div class="loader-icon">✨</div>
            <div class="loader-spinner"></div>
          </div>
          <div class="loader-content">
            <div class="loader-text"></div>
            <div class="loader-subtext"></div>
          </div>
        </div>
        <div class="loader-progress-container">
          <div class="loader-progress">
            <div class="progress-bar"></div>
          </div>
          <div class="loader-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
        <div class="skeleton-product-grid">
          <div class="skeleton-product-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-product-info">
              <div class="skeleton-title"></div>
              <div class="skeleton-description"></div>
              <div class="skeleton-price"></div>
            </div>
          </div>
          <div class="skeleton-product-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-product-info">
              <div class="skeleton-title"></div>
              <div class="skeleton-description"></div>
              <div class="skeleton-price"></div>
            </div>
          </div>
          <div class="skeleton-product-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-product-info">
              <div class="skeleton-title"></div>
              <div class="skeleton-description"></div>
              <div class="skeleton-price"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.scrollToBottom();
  },

  // NEW: Display thinking text in grey with thought tag
  updateThinkingText(messageElement, text) {
    console.log('[UI] updateThinkingText called, text length:', text ? text.length : 0);
    
    if (!messageElement) {
      console.warn('[UI] No messageElement for thinking text');
      return;
    }

    const contentDiv = messageElement.querySelector('.streaming-content');
    if (!contentDiv) {
      console.warn('[UI] No contentDiv found for thinking text');
      return;
    }

    // Remove existing thinking loader
    const thinkingLoader = contentDiv.querySelector('.thinking-loader');
    if (thinkingLoader) {
      thinkingLoader.remove();
    }

    // Clean up text
    const displayText = text.trim();
    console.log('[UI] Thinking text preview:', displayText.substring(0, 100));

    // Only show content if we have meaningful text content
    if (displayText && displayText.length > 0) {
      // Apply formatting
      const formattedText = this.formatMarkdownForStreaming(displayText);
      
      // Create thinking content with tag and grey styling
      contentDiv.innerHTML = `
        <div class="thinking-content">
          <div class="thought-tag">💭 Thinking...</div>
          <div class="thinking-text">${formattedText}</div>
        </div>
      `;
      
      console.log('[UI] Thinking content updated');
    }

    this.scrollToBottom();
  },

  // NEW: Clear thinking content when showing regular content
  clearThinkingContent(messageElement) {
    if (!messageElement) return;

    const contentDiv = messageElement.querySelector('.streaming-content');
    if (!contentDiv) return;

    const thinkingContent = contentDiv.querySelector('.thinking-content');
    if (thinkingContent) {
      thinkingContent.remove();
    }
  },

  // NEW: Simple function call widget
  showFunctionCallWidget(messageElement, functionCall) {
    console.log('[UI] showFunctionCallWidget called:', functionCall);
    
    if (!messageElement) {
      return;
    }

    const contentDiv = messageElement.querySelector('.streaming-content');
    if (!contentDiv) {
      return;
    }

    // Simple loading indicator with just dots
    contentDiv.innerHTML = `
      <div class="thinking-loader">
        <div class="thinking-dots">
          <span class="thinking-dot"></span>
          <span class="thinking-dot"></span>
          <span class="thinking-dot"></span>
        </div>
      </div>
    `;

    this.scrollToBottom();
  },

  // NEW: Hide function call widget
  hideFunctionCallWidget(messageElement) {
    // Just remove any loaders - keep it simple
    if (!messageElement) return;

    const contentDiv = messageElement.querySelector('.streaming-content');
    if (!contentDiv) return;

    const loader = contentDiv.querySelector('.thinking-loader');
    if (loader) {
      loader.remove();
    }
  },

  // NEW: Render content in order (text, products, text, etc.) with smooth animations
  async renderOrderedContent(containerDiv, content) {
    console.log('[UI] renderOrderedContent - content length:', content.length);
    
    // Parse content to find all elements in order
    const elements = [];
    let lastIndex = 0;
    
    // Find all tags and their positions
    const tagPattern = /<(text|productcard|productcardList)>([\s\S]*?)<\/(text|productcard|productcardList)>/g;
    let match;
    
    while ((match = tagPattern.exec(content)) !== null) {
      const tagType = match[1];
      const tagContent = match[2].trim();
      const startPos = match.index;
      
      elements.push({
        type: tagType,
        content: tagContent,
        position: startPos
      });
    }
    
    console.log('[UI] Found', elements.length, 'elements');
    
    // Sort by position to maintain order
    elements.sort((a, b) => a.position - b.position);
    
    // Render each element in order with delays
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      console.log(`[UI] Rendering element ${i + 1}:`, element.type);
      
      if (element.type === 'text') {
        // Render text with fade-in
        const textDiv = document.createElement('div');
        textDiv.className = 'text-section';
        textDiv.style.opacity = '0';
        textDiv.innerHTML = this.formatText(element.content);
        containerDiv.appendChild(textDiv);
        
        // Fade in
        await this.delay(50);
        textDiv.style.transition = 'opacity 0.4s ease-out';
        textDiv.style.opacity = '1';
        await this.delay(100);
        
      } else if (element.type === 'productcard') {
        // Render single product
        try {
          let jsonString = element.content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          const product = JSON.parse(jsonString);
          
          const gridDiv = document.createElement('div');
          gridDiv.className = 'product-grid-inline';
          gridDiv.style.opacity = '0';
          const card = this.createProductCard(product);
          card.style.opacity = '0';
          gridDiv.appendChild(card);
          containerDiv.appendChild(gridDiv);
          
          // Fade in grid then card
          await this.delay(100);
          gridDiv.style.transition = 'opacity 0.3s ease-out';
          gridDiv.style.opacity = '1';
          await this.delay(150);
          card.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
          card.style.opacity = '1';
          
        } catch (e) {
          console.error('[UI] Failed to parse productcard:', e);
        }
        
      } else if (element.type === 'productcardList') {
        // Show animated loading bar only
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'product-grid-inline';
        loadingDiv.innerHTML = `
          <div class="products-loading">
            <div class="loading-bar"><div class="loading-progress"></div></div>
          </div>
        `;
        containerDiv.appendChild(loadingDiv);
        
        await this.delay(800);
        
        // Parse products
        try {
          // Clean and extract JSON
          let jsonString = element.content.trim();
          
          // Remove control characters
          jsonString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          
          // Try to find JSON array if content has extra text
          let arrayMatch = jsonString.match(/\[[\s\S]*?\]/);
          if (arrayMatch) {
            jsonString = arrayMatch[0];
          } else if (jsonString.startsWith('{')) {
            // If no array found but starts with {, wrap in brackets
            // This handles comma-separated objects that aren't wrapped
            jsonString = '[' + jsonString + ']';
          }
          
          console.log('[UI] Attempting to parse JSON (first 300 chars):', jsonString.substring(0, 300));
          
          let products;
          try {
            products = JSON.parse(jsonString);
          } catch (firstError) {
            // If parsing fails, try to fix common issues
            console.log('[UI] First parse failed, attempting to fix JSON...');
            
            // Try to find all complete JSON objects and wrap them in array
            const objectMatches = jsonString.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
            if (objectMatches && objectMatches.length > 0) {
              jsonString = '[' + objectMatches.join(',') + ']';
              console.log('[UI] Reconstructed JSON with', objectMatches.length, 'objects');
              products = JSON.parse(jsonString);
            } else {
              throw firstError;
            }
          }
          
          if (Array.isArray(products) && products.length > 0) {
            // Remove loading
            loadingDiv.remove();
            
            // Create grid
            const gridDiv = document.createElement('div');
            gridDiv.className = 'product-grid-inline';
            containerDiv.appendChild(gridDiv);
            
            // Add products one by one
            for (let j = 0; j < products.length; j++) {
              const card = this.createProductCard(products[j]);
              card.style.opacity = '0';
              card.style.transform = 'translateX(-20px)';
              gridDiv.appendChild(card);
              
              // Animate in
              await this.delay(150);
              card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
              card.style.opacity = '1';
              card.style.transform = 'translateX(0)';
            }
            
            await this.delay(200);
          }
        } catch (e) {
          console.error('[UI] Failed to parse productcardList:', e);
          console.error('[UI] Raw content:', element.content);
          loadingDiv.remove();
        }
      }
    }
    
    // If no elements found, show the raw content
    if (elements.length === 0) {
      console.log('[UI] No structured elements, showing raw content');
      containerDiv.innerHTML = this.formatText(content);
    }
    
    this.scrollToBottom();
  }
});

