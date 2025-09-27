/* ENHANCED AI CITIZENSHIP INTAKE - CLEAN DESIGN VERSION */

// Theme Manager - First Priority
class ThemeManager {
  static init() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.themeIcon = document.getElementById('theme-icon');
    
    console.log('Theme elements found:', this.themeToggle, this.themeIcon);
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    this.setTheme(savedTheme);
    
    // Add click listener
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        console.log('Theme toggle clicked!');
        this.toggleTheme();
      });
    }
  }
  
  static setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (this.themeIcon) {
      this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    localStorage.setItem('theme', theme);
    console.log('Theme set to:', theme);
  }
  
  static toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
}

// Global State Management
class AppState {
  constructor() {
    this.data = {
      caseId: null,
      step: 0,
      chatHistory: [],
      lastActivity: Date.now()
    };
    this.restore();
  }

  set(key, value) {
    this.data[key] = value;
    this.data.lastActivity = Date.now();
    this.save();
  }

  get(key) {
    return this.data[key];
  }

  save() {
    try {
      localStorage.setItem('citizenship-intake-state', JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }

  restore() {
    try {
      const saved = localStorage.getItem('citizenship-intake-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.lastActivity < 24 * 60 * 60 * 1000) {
          this.data = { ...this.data, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Failed to restore state:', e);
    }
  }
}

// Main Application Class
class CitizenshipIntakeApp {
  constructor() {
    this.state = new AppState();
    this.initializeElements();
    this.setupEventListeners();
    this.setupCaseId();
    this.startConversation();
    
    console.log('🚀 Clean AI Citizenship Intake initialized successfully!');
  }

  initializeElements() {
    // Updated selectors for new clean design
    this.chatMessages = document.querySelector('.chat-messages');
    this.chatForm = document.querySelector('.chat-input-form');
    this.chatInput = this.chatForm?.querySelector('.chat-input');
    this.sendButton = this.chatForm?.querySelector('.btn-send');
    this.uploadForm = document.querySelector('.upload-form');
    this.uploadResult = document.getElementById('upload-result');
    this.quickActions = document.querySelectorAll('.quick-action');
    this.steps = document.querySelectorAll('.step');
    
    console.log('Elements found:', {
      chatMessages: !!this.chatMessages,
      chatForm: !!this.chatForm,
      chatInput: !!this.chatInput,
      quickActions: this.quickActions.length,
      steps: this.steps.length
    });
    
    if (!this.chatMessages || !this.chatForm) {
      console.error('Required chat elements not found!');
      return;
    }
  }

  setupEventListeners() {
    // Chat form submission
    if (this.chatForm) {
      this.chatForm.addEventListener('submit', (e) => this.handleChatSubmit(e));
    }

    // Upload form
    if (this.uploadForm) {
      this.uploadForm.addEventListener('submit', (e) => this.handleFileUpload(e));
    }

    // Quick action buttons
    this.quickActions.forEach(button => {
      button.addEventListener('click', () => {
        const text = button.textContent;
        this.handleQuickAction(text);
      });
    });

    // Process steps
    this.steps.forEach(step => {
      step.addEventListener('click', () => {
        const action = step.getAttribute('data-action');
        this.handleStepClick(action);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'k':
            e.preventDefault();
            this.chatInput?.focus();
            break;
        }
      }
    });
  }

  async setupCaseId() {
    try {
      const response = await fetch('/api/case/new', { method: 'POST' });
      const data = await response.json();
      if (data.ok) {
        this.state.set('caseId', data.case_id);
        console.log('Case ID created:', data.case_id);
      }
    } catch (error) {
      console.error('Error creating case ID:', error);
    }
  }

  async handleChatSubmit(e) {
    e.preventDefault();
    
    if (!this.chatInput?.value.trim()) return;
    
    const userMessage = this.chatInput.value.trim();
    this.addMessage(userMessage, 'user');
    this.chatInput.value = '';
    
    // Show typing indicator
    this.showTypingIndicator();
    
    try {
      await this.sendMessageToAPI(userMessage);
    } catch (error) {
      console.error('Error processing response:', error);
      this.addMessage('I apologize, but I encountered an error. Please try again.', 'assistant');
    } finally {
      this.hideTypingIndicator();
    }
  }

  async sendMessageToAPI(message) {
    try {
      const response = await fetch('/api/chat?case_id=' + (this.state.get('caseId') || ''), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message, 
          session_id: this.state.get('caseId') ? ('case-' + this.state.get('caseId')) : 'demo' 
        })
      });
      
      const data = await response.json();
      this.addMessage(data.reply, 'assistant');
      
      // Check for eligibility assessment
      const ancestor = data.extraction?.ancestor_chain?.[0] || {};
      const emigrationYear = ancestor.emigration_year || null;
      const naturalizationYear = ancestor.naturalization_year || null;
      
      if (emigrationYear || naturalizationYear) {
        await this.performEligibilityCheck(emigrationYear, naturalizationYear);
      }
      
    } catch (error) {
      throw error;
    }
  }

  async performEligibilityCheck(emigrationYear, naturalizationYear) {
    try {
      const response = await fetch('/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          case_id: this.state.get('caseId'), 
          emigration_year: emigrationYear, 
          naturalization_year: naturalizationYear 
        })
      });
      
      const result = await response.json();
      let html = `**Eligibility Assessment:**<br><strong>Verdict: ${result.verdict}</strong> — Confidence: ${Math.round(result.confidence * 100)}%`;
      
      if (result.reasons?.length) {
        html += `<br><br><strong>Analysis:</strong><br>• ${result.reasons.join('<br>• ')}`;
      }
      if (result.risks?.length) {
        html += `<br><br><strong>Risks:</strong><br>• ${result.risks.join('<br>• ')}`;
      }
      if (result.next_documents?.length) {
        html += `<br><br><strong>Required Documents:</strong><br>• ${result.next_documents.join('<br>• ')}`;
      }
      
      this.addMessage(html, 'assistant');
      
    } catch (error) {
      console.error('Eligibility check error:', error);
    }
  }

  async handleFileUpload(e) {
    e.preventDefault();
    
    const fileInput = this.uploadForm.querySelector('.file-input');
    const file = fileInput.files[0];
    const uploadButton = this.uploadForm.querySelector('.btn-upload');
    
    if (!file) {
      this.updateUploadStatus('Please select a file first.', 'error');
      return;
    }
    
    // Show upload progress
    uploadButton.textContent = 'Processing...';
    uploadButton.disabled = true;
    this.updateUploadStatus('Uploading and processing document...', 'info');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload?case_id=' + (this.state.get('caseId') || ''), {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      this.updateUploadStatus(`✅ Document processed: ${data.filename || 'file'} • ${data.method || ''} • Pages: ${data.pages || 1}`, 'success');
      
      const messageHtml = `**Document Received:** ${data.filename || 'file'}<br><small>${data.excerpt || 'Document processed successfully'}</small>`;
      this.addMessage(messageHtml, 'assistant');
      
    } catch (error) {
      console.error('Upload error:', error);
      this.updateUploadStatus('❌ Error processing document. Please try again.', 'error');
    } finally {
      uploadButton.textContent = 'Upload';
      uploadButton.disabled = false;
    }
  }

  handleQuickAction(text) {
    switch (text) {
      case 'Check eligibility':
        this.addMessage('Let\'s check your eligibility! Do you have Polish ancestors?', 'assistant');
        if (this.chatInput) {
          this.chatInput.focus();
        }
        break;
      case 'List required documents':
        this.showDocumentList();
        break;
      case 'Book consultation':
        this.showBookingOptions();
        break;
    }
    
    // CRITICAL FIX: Always scroll to chat section after quick actions
    setTimeout(() => {
      const chatSection = document.querySelector('.chat-section');
      if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  }

  showDocumentList() {
    const documents = `**Required Documents for Polish Citizenship by Descent:**<br><br>
<strong>For Your Polish Ancestor:</strong><br>
• Birth certificate (certified copy)<br>
• Death certificate (if applicable)<br>
• Marriage certificate (if applicable)<br>
• Immigration/emigration records<br>
• Polish passport (if available)<br><br>

<strong>For You:</strong><br>
• Your birth certificate<br>
• Marriage certificate (if applicable)<br>
• Current passport/ID<br>
• Proof of relationship to Polish ancestor<br><br>

<strong>Additional Documents:</strong><br>
• Military records (if applicable)<br>
• Naturalization papers (if ancestor became citizen elsewhere)<br>
• Church records (baptism, marriage, etc.)<br><br>

Would you like me to help you understand which specific documents apply to your case?`;
    
    this.addMessage(documents, 'assistant');
  }

  showBookingOptions() {
    const booking = `**Schedule Your Consultation:**<br><br>
<strong>Free 15-minute consultation:</strong><br>
• Eligibility assessment<br>
• Document requirements overview<br>
• Timeline estimation<br><br>

<strong>Full case review (paid):</strong><br>
• Detailed legal analysis<br>
• Document preparation guidance<br>
• Application strategy<br>
• Ongoing support<br><br>

Click "Book a call" below to schedule your consultation!`;
    
    this.addMessage(booking, 'assistant');
    
    setTimeout(() => {
      const finalSection = document.querySelector('.final-section');
      if (finalSection) {
        finalSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1000);
  }

  handleStepClick(action) {
    const actionMessages = {
      'start-chat': 'Let\'s begin! Tell me about your Polish ancestry.',
      'demo-dialogue': 'I\'ll ask specific questions about your family history and documents.',
      'show-eligibility': 'I\'ll provide a detailed eligibility assessment based on your information.',
      'upload-docs': 'You can upload documents for instant analysis using OCR technology.',
      'contact-info': 'I\'ll collect your contact information for follow-up.',
      'book-consultation': 'Schedule a call with our expert legal team.'
    };
    
    const message = actionMessages[action] || 'Let me help you with that step.';
    this.addMessage(message, 'assistant');
    
    // CRITICAL FIX: Always scroll to chat section and focus input after clicking any step
    setTimeout(() => {
      const chatSection = document.querySelector('.chat-section');
      if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Focus the chat input for immediate interaction
      if (this.chatInput) {
        this.chatInput.focus();
      }
      
      // Special case for upload docs - also scroll to upload section
      if (action === 'upload-docs') {
        setTimeout(() => {
          const uploadSection = document.querySelector('.upload-section');
          if (uploadSection) {
            uploadSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 1500);
      }
    }, 500);
  }

  addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${role}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = this.formatMessage(content);
    
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(timestamp);
    
    // Add message styles
    this.addMessageStyles();
    
    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
    
    // Save to chat history
    const chatHistory = this.state.get('chatHistory') || [];
    chatHistory.push({ role, content, timestamp: Date.now() });
    this.state.set('chatHistory', chatHistory);
  }

  addMessageStyles() {
    if (document.getElementById('chat-styles')) return;
    
    const styles = `
      .message {
        margin-bottom: 16px;
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 80%;
      }
      .message-user {
        background: var(--accent);
        color: white;
        margin-left: auto;
        text-align: right;
      }
      .message-assistant {
        background: var(--card);
        border: 1px solid var(--border);
        margin-right: auto;
      }
      .message-content {
        line-height: 1.5;
      }
      .message-timestamp {
        font-size: 11px;
        opacity: 0.6;
        margin-top: 4px;
      }
      .typing-indicator {
        padding: 12px 16px;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 12px;
        margin-bottom: 16px;
        max-width: 80%;
      }
      .typing-dots {
        display: flex;
        gap: 4px;
      }
      .typing-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--text-muted);
        /* No animations per user request */
      }
      .typing-dots span:nth-child(1) { /* No animations per user request */ }
      .typing-dots span:nth-child(2) { /* No animations per user request */ }
      /* Removed keyframes per user request */
    `;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'chat-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  showTypingIndicator() {
    this.hideTypingIndicator();
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    
    this.chatMessages.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  formatMessage(content) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  updateUploadStatus(message, type) {
    if (this.uploadResult) {
      this.uploadResult.textContent = message;
      this.uploadResult.style.color = type === 'error' ? '#dc3545' : 
                                     type === 'success' ? '#39d353' : 'var(--text-muted)';
    }
  }

  startConversation() {
    // Restore chat history or start fresh
    const chatHistory = this.state.get('chatHistory') || [];
    
    if (chatHistory.length > 0) {
      chatHistory.forEach(message => {
        this.addMessage(message.content, message.role);
      });
    } else {
      setTimeout(() => {
        this.addMessage('Welcome! I\'m your AI citizenship assistant. I\'ll help you assess your eligibility for Polish citizenship by descent. Ready to begin?', 'assistant');
      }, 1000);
    }
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Initializing...');
  
  // Initialize theme manager first
  ThemeManager.init();
  
  // Initialize main app
  setTimeout(() => {
    window.intakeApp = new CitizenshipIntakeApp();
    
    // Auto-focus chat input after initialization
    setTimeout(() => {
      const chatInput = document.querySelector('.chat-input');
      if (chatInput) {
        chatInput.focus();
      }
    }, 1500);
  }, 500);
});

// Error handling
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});