// UI Products Module - Product cards, selection, and context management
Object.assign(UI, {
  addProductGrid(products) {
    const gridDiv = document.createElement('div');
    gridDiv.className = 'product-grid';

    products.forEach(product => {
      const card = this.createProductCard(product);
      gridDiv.appendChild(card);
    });

    this.chatContainer.appendChild(gridDiv);
    this.scrollToBottom();
  },

  createProductCard(product) {
    console.log('Creating card for product:', product);

    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.url || product.name;
    card.dataset.productData = JSON.stringify(product);

    const imageUrl = Array.isArray(product.image) ? product.image[0] : product.image;

    // Support both old (retailPrice/discountedPrice) and new (price/discountedPrice) formats
    const retailPrice = product.retailPrice || product.price;
    const discountedPrice = product.discountedPrice;

    console.log('Image:', imageUrl);
    console.log('Prices:', { retailPrice, discountedPrice });

    // Calculate discount percentage
    let discountBadge = '';
    if (retailPrice && discountedPrice && retailPrice !== discountedPrice) {
      const retail = parseFloat(retailPrice.replace(/[^0-9.]/g, ''));
      const discounted = parseFloat(discountedPrice.replace(/[^0-9.]/g, ''));
      if (retail > discounted) {
        const discount = Math.round(((retail - discounted) / retail) * 100);
        discountBadge = `<span class="price-discount">${discount}% OFF</span>`;
      }
    }

    card.innerHTML = `
      <div class="product-select-checkbox">
        <input type="checkbox" class="product-checkbox" />
        <span class="checkbox-custom"></span>
      </div>
      <a href="${product.url || '#'}" target="_blank" rel="noopener noreferrer" class="product-link">
        <div class="product-image-container">
          <img src="${imageUrl || 'https://placehold.co/80x80?text=No+Image'}" alt="${product.name || 'Product'}" class="product-image"
               onerror="this.src='https://placehold.co/80x80?text=No+Image'">
        </div>
      </a>
      <div class="product-info">
        <h3 class="product-name" title="${product.name || 'Unknown Product'}">${product.name || 'Unknown Product'}</h3>
        <div class="product-description">${(product.description || '').substring(0, 80)}${product.description && product.description.length > 80 ? '...' : ''}</div>
        ${product.brand ? `<div class="product-brand-text">by ${product.brand}</div>` : ''}
      </div>
      <div class="product-pricing">
        <div class="price-container">
          <span class="price-current">${discountedPrice || retailPrice || 'N/A'}</span>
          ${retailPrice && discountedPrice && retailPrice !== discountedPrice
        ? `<span class="price-original">${retailPrice}</span>`
        : ''}
        </div>
        ${discountBadge}
      </div>
      <a href="${product.url || '#'}" target="_blank" rel="noopener noreferrer" class="view-product-indicator">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
    `;

    // Add click handler for selection
    const checkbox = card.querySelector('.product-checkbox');
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      this.toggleProductSelection(card, product);
    });

    return card;
  },

  toggleProductSelection(card, product) {
    const productId = card.dataset.productId;
    const index = this.selectedProducts.findIndex(p => p.id === productId);

    if (index > -1) {
      // Deselect
      this.selectedProducts.splice(index, 1);
      card.classList.remove('selected');
      console.log('[UI] Product deselected:', productId, 'Remaining:', this.selectedProducts.length);
    } else {
      // Select
      this.selectedProducts.push({
        id: productId,
        data: product
      });
      card.classList.add('selected');
      console.log('[UI] Product selected:', productId, 'Total selected:', this.selectedProducts.length);
    }

    this.updateContextChips();
  },

  updateContextChips() {
    const inputForm = document.querySelector('.input-form');
    let chipsContainer = inputForm.querySelector('.context-chips');

    if (!chipsContainer) {
      chipsContainer = document.createElement('div');
      chipsContainer.className = 'context-chips';
      inputForm.insertBefore(chipsContainer, inputForm.firstChild);
    }

    chipsContainer.innerHTML = '';

    this.selectedProducts.forEach(({ id, data }) => {
      const chip = document.createElement('div');
      chip.className = 'context-chip';
      chip.innerHTML = `
        <span class="chip-text">${data.name.substring(0, 30)}...</span>
        <button class="chip-remove" data-id="${id}">×</button>
      `;

      chip.querySelector('.chip-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeProductFromContext(id);
      });

      chipsContainer.appendChild(chip);
    });

    // Add/remove has-context class to keep form expanded
    if (this.selectedProducts.length > 0) {
      inputForm.classList.add('has-context');
    } else {
      inputForm.classList.remove('has-context');
      chipsContainer.remove();
    }
  },

  removeProductFromContext(productId) {
    const index = this.selectedProducts.findIndex(p => p.id === productId);
    if (index > -1) {
      this.selectedProducts.splice(index, 1);
    }

    // Update card visual
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (card) {
      card.classList.remove('selected');
      const checkbox = card.querySelector('.product-checkbox');
      if (checkbox) checkbox.checked = false;
    }

    this.updateContextChips();
  },

  getSelectedProductsContext() {
    console.log('[UI] getSelectedProductsContext called, selectedProducts:', this.selectedProducts);
    const context = this.selectedProducts.map(p => p.data);
    console.log('[UI] Returning context:', context);
    return context;
  }
});

