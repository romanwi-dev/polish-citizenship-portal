// Enhanced AI Citizenship Intake - Beautiful & User-Friendly Version
// Optimized for non-tech users with better visual feedback and animations

class EnhancedThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.themeIcon = document.getElementById('theme-icon');
    this.init();
  }

  init() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    this.setTheme(savedTheme);
    
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (this.themeIcon) {
      this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    localStorage.setItem('theme', theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    
    // Add celebration animation
    this.addThemeChangeAnimation();
  }
  
  addThemeChangeAnimation() {
    if (this.themeToggle) {
      this.themeToggle.style.animation = 'none';
      setTimeout(() => {
        /* No animations per user request */
      }, 10);
      
      setTimeout(() => {
        this.themeToggle.style.animation = '';
      }, 600);
    }
  }
}

// Enhanced Journey Progress Tracker
class JourneyProgressTracker {
  constructor() {
    this.completedSteps = new Set();
    this.currentStep = 0;
    this.totalSteps = 6;
    this.progressBar = document.getElementById('journeyProgress');
    this.init();
  }
  
  init() {
    this.updateProgressBar();
  }
  
  markStepCompleted(stepNumber) {
    this.completedSteps.add(stepNumber);
    this.currentStep = Math.max(this.currentStep, stepNumber);
    this.updateProgressBar();
    this.updateStepVisuals(stepNumber);
    this.celebrateProgress();
  }
  
  updateProgressBar() {
    if (this.progressBar) {
      const progressPercentage = (this.completedSteps.size / this.totalSteps) * 100;
      this.progressBar.style.width = `${progressPercentage}%`;
    }
  }
  
  updateStepVisuals(stepNumber) {
    const stepElement = document.querySelector(`[data-action]:nth-child(${stepNumber})`);
    if (stepElement) {
      stepElement.classList.add('completed');
      const progressBar = stepElement.querySelector('.step-progress');
      if (progressBar) {
        setTimeout(() => {
          progressBar.style.width = '100%';
        }, 300);
      }
    }
  }
  
  celebrateProgress() {
    // Add celebration animation
    if (this.progressBar) {
      this.progressBar.style.boxShadow = '0 0 20px rgba(88, 166, 255, 0.6)';
      setTimeout(() => {
        this.progressBar.style.boxShadow = '';
      }, 1000);
    }
  }
}

// Enhanced Application State Management
class EnhancedAppState {
  constructor() {
    this.state = new Map();
    this.load();
  }

  set(key, value) {
    this.state.set(key, value);
    this.save();
  }

  get(key) {
    return this.state.get(key);
  }

  save() {
    try {
      const stateObj = Object.fromEntries(this.state);
      localStorage.setItem('citizenshipIntakeState', JSON.stringify(stateObj));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }

  load() {
    try {
      const saved = localStorage.getItem('citizenshipIntakeState');
      if (saved) {
        const stateObj = JSON.parse(saved);
        this.state = new Map(Object.entries(stateObj));
      }
    } catch (e) {
      console.warn('Failed to restore state:', e);
    }
  }
}

// Main Enhanced Application Class
class EnhancedCitizenshipIntakeApp {
  constructor() {
    this.state = new EnhancedAppState();
    this.progressTracker = new JourneyProgressTracker();
    this.initializeElements();
    this.setupEventListeners();
    this.setupCaseId();
    this.startConversation();
    this.addQuietAnimations();
  }

  initializeElements() {
    this.chatMessages = document.querySelector('.chat-messages');
    this.chatForm = document.querySelector('.chat-input-form');
    this.chatInput = this.chatForm?.querySelector('.chat-input');
    this.sendButton = this.chatForm?.querySelector('.btn-send');
    this.uploadForm = document.querySelector('.upload-form');
    this.uploadResult = document.getElementById('upload-result');
    this.quickActions = document.querySelectorAll('.quick-action');
    this.steps = document.querySelectorAll('.step');
    
    console.log('Enhanced elements found:', {
      chatMessages: !!this.chatMessages,
      chatForm: !!this.chatForm,
      chatInput: !!this.chatInput,
      quickActions: this.quickActions.length,
      steps: this.steps.length
    });
  }

  setupEventListeners() {
    // Enhanced chat form with better feedback
    if (this.chatForm) {
      this.chatForm.addEventListener('submit', (e) => this.handleChatSubmit(e));
    }

    // Enhanced upload form
    if (this.uploadForm) {
      this.uploadForm.addEventListener('submit', (e) => this.handleFileUpload(e));
    }

    // Fixed quick action buttons - CRITICAL BUG FIX
    this.quickActions.forEach((button, index) => {
      button.addEventListener('click', () => {
        console.log('Quick action clicked:', button.textContent.trim());
        
        // FIXED: Get button text directly (no icons to remove now)
        const cleanText = button.textContent.trim();
        
        console.log('Extracted text:', cleanText);
        
        // No animations - completely quiet
        
        this.handleQuickAction(cleanText);
        this.progressTracker.markStepCompleted(index + 1);
      });
    });

    // Fixed step buttons with quiet feedback  
    this.steps.forEach((step, index) => {
      step.addEventListener('click', () => {
        // No animations - completely quiet
        
        const action = step.getAttribute('data-action');
        this.handleStepClick(action);
        this.progressTracker.markStepCompleted(index + 1);
      });
    });

    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'k':
            e.preventDefault();
            this.focusChatInput();
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
            e.preventDefault();
            this.triggerStepByNumber(parseInt(e.key));
            break;
        }
      }
    });
  }

  // QUIET animations - simple and professional
  addQuietAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      /* Removed keyframes per user request */
    `;
    document.head.appendChild(style);
  }

  // REMOVED - No aggressive animations needed

  focusChatInput() {
    if (this.chatInput) {
      this.chatInput.focus();
      /* No animations per user request */
      setTimeout(() => {
        this.chatInput.style.animation = '';
      }, 600);
    }
  }

  triggerStepByNumber(stepNumber) {
    const step = document.querySelector(`[data-action]:nth-child(${stepNumber})`);
    if (step) {
      step.click();
    }
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
    
    // Add loading state to send button
    const originalText = this.sendButton.textContent;
    this.sendButton.textContent = '⏳';
    this.sendButton.disabled = true;
    
    const userMessage = this.chatInput.value.trim();
    this.addMessage(userMessage, 'user');
    this.chatInput.value = '';
    
    // Show enhanced typing indicator
    this.showEnhancedTypingIndicator();
    
    try {
      await this.sendMessageToAPI(userMessage);
    } catch (error) {
      console.error('Error processing response:', error);
      this.addMessage('I apologize, but I encountered an error. Please try again.', 'assistant');
    } finally {
      this.hideTypingIndicator();
      this.sendButton.textContent = originalText;
      this.sendButton.disabled = false;
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
      
      // Enhanced eligibility check
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
      let html = `**🎯 Eligibility Assessment:**<br><strong>Verdict: ${result.verdict}</strong> — Confidence: ${Math.round(result.confidence * 100)}%`;
      
      if (result.reasons?.length) {
        html += `<br><br><strong>📋 Analysis:</strong><br>• ${result.reasons.join('<br>• ')}`;
      }
      if (result.risks?.length) {
        html += `<br><br><strong>⚠️ Risks:</strong><br>• ${result.risks.join('<br>• ')}`;
      }
      if (result.next_documents?.length) {
        html += `<br><br><strong>📄 Required Documents:</strong><br>• ${result.next_documents.join('<br>• ')}`;
      }
      
      this.addMessage(html, 'assistant');
      
    } catch (error) {
      console.error('Eligibility check error:', error);
    }
  }

  async handleFileUpload(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const file = formData.get('file');
    
    if (!file || file.size === 0) {
      this.updateUploadStatus('❌ Please select a file to upload.', 'error');
      return;
    }
    
    // Enhanced upload feedback
    const uploadButton = e.target.querySelector('button[type="submit"]');
    uploadButton.textContent = '🔄 Processing...';
    uploadButton.disabled = true;
    this.updateUploadStatus('📤 Uploading and processing document...', 'info');
    
    try {
      const response = await fetch('/api/upload?case_id=' + (this.state.get('caseId') || ''), {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      this.updateUploadStatus(`✅ Document processed: ${data.filename || 'file'} • ${data.method || ''} • Pages: ${data.pages || 1}`, 'success');
      
      const messageHtml = `**📄 Document Received:** ${data.filename || 'file'}<br><small>✨ ${data.excerpt || 'Document processed successfully'}</small>`;
      this.addMessage(messageHtml, 'assistant');
      
    } catch (error) {
      console.error('Upload error:', error);
      this.updateUploadStatus('❌ Error processing document. Please try again.', 'error');
    } finally {
      uploadButton.textContent = '📤 Upload';
      uploadButton.disabled = false;
    }
  }

  handleQuickAction(text) {
    switch (text) {
      case 'Check eligibility':
        this.addMessage('🎯 Let\'s check your eligibility! Do you have Polish ancestors?', 'assistant');
        if (this.chatInput) {
          this.chatInput.focus();
        }
        break;
      case 'List required documents':
        this.showEnhancedDocumentList();
        break;
      case 'Book consultation':
        this.showEnhancedBookingOptions();
        break;
    }
    
    // Enhanced scroll with smooth animation
    setTimeout(() => {
      const chatSection = document.querySelector('.chat-section');
      if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  }

  showEnhancedDocumentList() {
    const documents = `**📋 Required Documents for Polish Citizenship by Descent:**<br><br>
<strong>🏛️ For Your Polish Ancestor:</strong><br>
• 📜 Birth certificate (certified copy)<br>
• ⚰️ Death certificate (if applicable)<br>
• 💒 Marriage certificate (if applicable)<br>
• 🛳️ Immigration/emigration records<br>
• 🇵🇱 Polish passport (if available)<br><br>

<strong>👤 For You:</strong><br>
• 📜 Your birth certificate<br>
• 💒 Marriage certificate (if applicable)<br>
• 🛂 Current passport/ID<br>
• 🔗 Proof of relationship to Polish ancestor<br><br>

<strong>📎 Additional Documents:</strong><br>
• 🪖 Military records (if applicable)<br>
• 🏛️ Naturalization papers (if ancestor became citizen elsewhere)<br>
• ⛪ Church records (baptism, marriage, etc.)<br><br>

💡 **Would you like me to help you understand which specific documents apply to your case?**`;
    
    this.addMessage(documents, 'assistant');
  }

  showEnhancedBookingOptions() {
    const booking = `**📅 Schedule Your Consultation:**<br><br>
<strong>🆓 Free 15-minute consultation:</strong><br>
• ✅ Eligibility assessment<br>
• 📋 Document requirements overview<br>
• ⏰ Timeline estimation<br><br>

<strong>💎 Full case review (paid):</strong><br>
• 🔍 Detailed legal analysis<br>
• 📄 Document preparation guidance<br>
• 🎯 Application strategy<br>
• 🤝 Ongoing support<br><br>

🎯 **Click "Book a call" below to schedule your consultation!**`;
    
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
      'start-chat': '🏡 Let\'s begin! Tell me about your Polish ancestry.',
      'demo-dialogue': '💬 I\'ll ask specific questions about your family history and documents.',
      'show-eligibility': '⚖️ I\'ll provide a detailed eligibility assessment based on your information.',
      'upload-docs': '📄 You can upload documents for instant analysis using OCR technology.',
      'contact-info': '📞 I\'ll collect your contact information for follow-up.',
      'book-consultation': '🎯 Schedule a call with our expert legal team.'
    };
    
    const message = actionMessages[action] || '✨ Let me help you with that step.';
    this.addMessage(message, 'assistant');
    
    // Enhanced scroll with focus
    setTimeout(() => {
      const chatSection = document.querySelector('.chat-section');
      if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      if (this.chatInput) {
        this.chatInput.focus();
      }
      
      // Special case for upload docs
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
    this.formatMessageSafely(content, messageContent);
    
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(timestamp);
    
    this.addMessageStyles();
    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
    
    // Save to chat history
    const chatHistory = this.state.get('chatHistory') || [];
    chatHistory.push({ role, content, timestamp: Date.now() });
    this.state.set('chatHistory', chatHistory);
  }

  addMessageStyles() {
    if (document.getElementById('enhanced-chat-styles')) return;
    
    const styles = `
      .message {
        margin-bottom: 20px;
        padding: 16px 20px;
        border-radius: 18px;
        max-width: 85%;
        backdrop-filter: blur(10px);
        /* No animations */;
      }
      .message-user {
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
        color: white;
        margin-left: auto;
        text-align: right;
        box-shadow: var(--shadow-md);
      }
      .message-assistant {
        background: var(--card);
        border: 1px solid var(--border);
        margin-right: auto;
        box-shadow: var(--shadow-sm);
      }
      .message-timestamp {
        font-size: 11px;
        opacity: 0.7;
        margin-top: 8px;
      }
      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        margin-bottom: 16px;
        opacity: 0.8;
      }
      .typing-dots {
        display: flex;
        gap: 4px;
      }
      .typing-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent);
        /* No animations per user request */
      }
      .typing-dots span:nth-child(1) { /* No animations per user request */ }
      .typing-dots span:nth-child(2) { /* No animations per user request */ }
      /* Removed keyframes per user request */
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'enhanced-chat-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  showEnhancedTypingIndicator() {
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
      <span>AI is thinking...</span>
    `;
    
    this.chatMessages.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.style.opacity = '0';
      setTimeout(() => indicator.remove(), 300);
    }
  }

  formatMessage(content) {
    // Return sanitized text - HTML will be created safely via DOM methods
    return content;
  }

  // Safe formatting that creates DOM elements instead of HTML strings
  formatMessageSafely(content, container) {
    // Split content by newlines to handle line breaks
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (index > 0) {
        container.appendChild(document.createElement('br'));
      }
      
      // Process bold and italic formatting safely
      this.processFormattingMarks(line, container);
    });
  }

  processFormattingMarks(text, container) {
    let currentIndex = 0;
    
    // Find bold (**text**) and italic (*text*) patterns
    const pattern = /(\*\*(.*?)\*\*|\*(.*?)\*)/g;
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      // Add text before the match as plain text
      if (match.index > currentIndex) {
        const textNode = document.createTextNode(text.substring(currentIndex, match.index));
        container.appendChild(textNode);
      }
      
      // Create appropriate element for the match
      if (match[0].startsWith('**')) {
        // Bold text
        const strong = document.createElement('strong');
        strong.textContent = match[2];
        container.appendChild(strong);
      } else {
        // Italic text
        const em = document.createElement('em');
        em.textContent = match[3];
        container.appendChild(em);
      }
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      const textNode = document.createTextNode(text.substring(currentIndex));
      container.appendChild(textNode);
    }
  }

  scrollToBottom() {
    if (this.chatMessages) {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
  }

  updateUploadStatus(message, type) {
    if (this.uploadResult) {
      this.uploadResult.textContent = message;
      this.uploadResult.style.color = type === 'error' ? '#dc3545' : 
                                     type === 'success' ? '#39d353' : 'var(--accent)';
    }
  }

  startConversation() {
    const chatHistory = this.state.get('chatHistory') || [];
    
    if (chatHistory.length > 0) {
      chatHistory.forEach(message => {
        this.addMessage(message.content, message.role);
      });
    } else {
      setTimeout(() => {
        this.addMessage('🇵🇱 **Welcome to your AI Citizenship Assessment!**<br><br>I\'m here to help you explore your Polish citizenship eligibility. Let\'s start with some basic information about your Polish ancestry.<br><br>💡 **To get started:** Click any numbered step above or tell me about your Polish ancestor.', 'assistant');
      }, 1000);
    }
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Enhanced AI Citizenship Intake - Initializing...');
  
  // Initialize enhanced theme manager first
  new EnhancedThemeManager();
  
  // Initialize enhanced application
  setTimeout(() => {
    new EnhancedCitizenshipIntakeApp();
    console.log('✨ Enhanced AI Citizenship Intake initialized successfully!');
  }, 100);
});