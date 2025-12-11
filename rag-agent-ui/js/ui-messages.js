// UI Messages Module - Message rendering, parsing, and formatting
Object.assign(UI, {
  addMessage(role, content, files = []) {
    console.log('Adding message:', role, 'Content length:', content.length, 'Files:', files.length);
    console.log('Full content:', content);

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

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
    contentDiv.className = 'message-content';

    // Parse content for products
    const { text, products } = this.parseMessageContent(content);
    console.log('Parsed text length:', text.length, 'Products:', products);
    contentDiv.innerHTML = this.formatText(text);

    messageDiv.appendChild(header);
    messageDiv.appendChild(contentDiv);

    // Add file attachments if present
    if (files && files.length > 0) {
      const filesDiv = this.createFileAttachmentsDisplay(files);
      messageDiv.appendChild(filesDiv);
    }

    this.chatContainer.appendChild(messageDiv);

    // Add products inline if present
    if (products && products.length > 0) {
      console.log('Adding product grid with', products.length, 'products');
      this.addProductGrid(products);
    } else {
      console.log('No products to display');
    }

    this.scrollToBottom();
  },

  createFileAttachmentsDisplay(files) {
    const filesDiv = document.createElement('div');
    filesDiv.className = 'message-attachments';
    
    files.forEach(file => {
      const fileDiv = document.createElement('div');
      fileDiv.className = 'attachment-item';
      
      const isImage = file.type.startsWith('image/');
      const fileSize = (file.size / 1024).toFixed(1);
      
      if (isImage) {
        // Create image preview
        const img = document.createElement('img');
        img.className = 'attachment-image';
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        img.title = file.name;
        
        fileDiv.appendChild(img);
      } else {
        // Create file icon with info
        fileDiv.innerHTML = `
          <div class="attachment-file">
            <div class="file-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="file-info">
              <div class="file-name">${file.name}</div>
              <div class="file-size">${fileSize}KB</div>
            </div>
          </div>
        `;
      }
      
      filesDiv.appendChild(fileDiv);
    });
    
    return filesDiv;
  },

  parseMessageContent(content) {
    console.log('Parsing content for components...');

    let remainingContent = content;
    let allProducts = [];

    // Extract <text> content first
    let textContent = '';
    const textRegex = /<text>\s*([\s\S]*?)<\/text>/gi;
    let textMatch;
    const textMatches = [];

    // First pass: collect all text matches
    while ((textMatch = textRegex.exec(content)) !== null) {
      textMatches.push(textMatch[1].trim());
    }

    // Join all text content with spacing
    if (textMatches.length > 0) {
      textContent = textMatches.join('\n\n');
      // Remove all text tags from remaining content
      remainingContent = remainingContent.replace(/<text>\s*([\s\S]*?)<\/text>/gi, '');
    }

    // Extract <productcard> (single product)
    const productCardRegex = /<productcard>\s*([\s\S]*?)<\/productcard>/gi;
    let match;
    while ((match = productCardRegex.exec(content)) !== null) {
      try {
        let jsonString = match[1].trim();
        jsonString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        jsonString = jsonString.replace(/\u00a0/g, ' ');

        console.log('Found productcard component, parsing...');
        const product = JSON.parse(jsonString);
        allProducts.push(product);

        remainingContent = remainingContent.replace(match[0], '');
      } catch (e) {
        console.error("Failed to parse productcard component:", e);
        console.log("JSON string was:", match[1].substring(0, 500));
      }
    }

    // Extract <productcardList> (multiple products)
    const productListRegex = /<productcardList>\s*([\s\S]*?)<\/productcardList>/gi;
    while ((match = productListRegex.exec(content)) !== null) {
      try {
        let jsonString = match[1].trim();
        jsonString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        jsonString = jsonString.replace(/\u00a0/g, ' ');

        console.log('Found productcardList component, parsing...');
        const productArray = JSON.parse(jsonString);
        if (Array.isArray(productArray)) {
          allProducts = allProducts.concat(productArray);
        }

        remainingContent = remainingContent.replace(match[0], '');
      } catch (e) {
        console.error("Failed to parse productcardList component:", e);
        console.log("JSON string was:", match[1].substring(0, 500));
      }
    }

    // Fallback: Try legacy formats for backward compatibility
    if (allProducts.length === 0 && textContent === '') {
      console.log('No new format components, trying legacy formats...');

      // Try old PRODUCT format
      const productRegex = /<PRODUCT>\s*([\s\S]*?)<\/PRODUCT>/gi;
      while ((match = productRegex.exec(content)) !== null) {
        try {
          let jsonString = match[1].trim();
          jsonString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          jsonString = jsonString.replace(/\u00a0/g, ' ');

          const productData = JSON.parse(jsonString);
          if (productData.products && Array.isArray(productData.products)) {
            allProducts = allProducts.concat(productData.products);
          }
          remainingContent = remainingContent.replace(match[0], '');
        } catch (e) {
          console.error("Failed to parse PRODUCT component:", e);
        }
      }

      // Try old JSON format
      const jsonRegex = /<JSON>\s*([\s\S]*?)<\/JSON>/gi;
      while ((match = jsonRegex.exec(content)) !== null) {
        try {
          let jsonString = match[1].trim();
          jsonString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          jsonString = jsonString.replace(/\u00a0/g, ' ');

          const productData = JSON.parse(jsonString);
          if (productData.type === 'product_cards' && productData.products) {
            allProducts = allProducts.concat(productData.products);
            remainingContent = remainingContent.replace(match[0], '');
          }
        } catch (e) {
          console.error("Failed to parse JSON component:", e);
        }
      }

      // Use remaining content as text if no structured text was found
      if (textContent === '') {
        textContent = remainingContent;
        remainingContent = '';
      }
    }

    // Clean up any remaining tags and whitespace
    remainingContent = remainingContent
      .replace(/<\/?text>/gi, '')
      .replace(/<\/?productcard>/gi, '')
      .replace(/<\/?productcardList>/gi, '')
      .replace(/<JSON>[\s\S]*?<\/JSON>/gi, '')
      .replace(/<PRODUCT>[\s\S]*?<\/PRODUCT>/gi, '')
      .trim();

    // Use textContent if we found structured text, otherwise use remaining content  
    // But NEVER use both to avoid duplication
    const finalText = textContent.trim() ? textContent.trim() : remainingContent.trim();

    return {
      text: finalText,
      products: allProducts.length > 0 ? allProducts : null
    };
  },

  formatText(text) {
    // Text is already cleaned by parseMessageContent
    // Just format the markdown

    // Split into lines and process
    const lines = text.split('\n');
    const processed = [];
    let inList = false;
    let inTable = false;
    let tableRows = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const trimmed = line.trim();

      // Detect table rows (lines with |)
      if (trimmed.includes('|')) {
        if (inList) {
          processed.push('</ul>');
          inList = false;
        }
        
        // Skip separator rows (e.g., |---|---|)
        if (trimmed.match(/^\|[\s\-:]+\|/)) {
          continue;
        }
        
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        
        tableRows.push(trimmed);
        continue;
      } else if (inTable) {
        // End of table, render it
        processed.push(this.renderTable(tableRows));
        inTable = false;
        tableRows = [];
      }

      // Skip empty lines
      if (!trimmed) {
        if (inList) {
          processed.push('</ul>');
          inList = false;
        }
        continue;
      }

      // Headings (## or ###)
      if (trimmed.startsWith('### ')) {
        if (inList) {
          processed.push('</ul>');
          inList = false;
        }
        processed.push(`<h3>${trimmed.substring(4)}</h3>`);
        continue;
      }

      if (trimmed.startsWith('## ')) {
        if (inList) {
          processed.push('</ul>');
          inList = false;
        }
        processed.push(`<h3>${trimmed.substring(3)}</h3>`);
        continue;
      }

      // Bullet points (* or - )
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        if (!inList) {
          processed.push('<ul>');
          inList = true;
        }
        const content = trimmed.substring(2).trim();
        // Apply bold formatting
        const formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processed.push(`<li>${formatted}</li>`);
        continue;
      }

      // Regular paragraphs
      if (inList) {
        processed.push('</ul>');
        inList = false;
      }

      // Apply bold formatting
      const formatted = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      processed.push(`<p>${formatted}</p>`);
    }

    // Close any open list
    if (inList) {
      processed.push('</ul>');
    }
    
    // Close any open table
    if (inTable) {
      processed.push(this.renderTable(tableRows));
    }

    return processed.join('');
  },

  renderTable(rows) {
    if (rows.length === 0) return '';
    
    let html = '<div class="table-container"><table class="comparison-table">';
    
    rows.forEach((row, index) => {
      const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
      const tag = index === 0 ? 'th' : 'td';
      
      html += '<tr>';
      cells.forEach(cell => {
        const formatted = cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html += `<${tag}>${formatted}</${tag}>`;
      });
      html += '</tr>';
    });
    
    html += '</table></div>';
    return html;
  },

  showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = `
      <div class="typing-header">
        <div class="message-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <span class="message-role">ShopAssist</span>
      </div>
      <div class="typing-content">
        <span class="typing-dot">•</span>
        <span class="typing-dot">•</span>
        <span class="typing-dot">•</span>
      </div>
    `;
    this.chatContainer.appendChild(indicator);
    this.scrollToBottom();
  },

  hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      indicator.remove();
    }
  }
});

