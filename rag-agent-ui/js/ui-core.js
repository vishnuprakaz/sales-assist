// UI Core Module - Base functionality
const UI = {
  chatContainer: null,
  selectedProducts: [],

  init() {
    this.chatContainer = document.getElementById('chatContainer');
  },

  scrollToBottom() {
    this.chatContainer.scrollTo({
      top: this.chatContainer.scrollHeight,
      behavior: 'smooth'
    });
  },

  // Helper function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

