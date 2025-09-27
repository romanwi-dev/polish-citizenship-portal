// Configuration file to handle API keys when environment variables are stuck
export const config = {
  // OpenAI API Key (use Secrets Dashboard to configure)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // Other service keys (managed via Secrets Dashboard)
  GOOGLE_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '',
  MICROSOFT_ACCESS_TOKEN: process.env.MICROSOFT_ACCESS_TOKEN || '',
  DROPBOX_ACCESS_TOKEN: process.env.DROPBOX_ACCESS_TOKEN || '',
  
  // Helper to check if we have a valid API key
  hasValidOpenAIKey(): boolean {
    return Boolean(this.OPENAI_API_KEY && this.OPENAI_API_KEY.startsWith('sk-') && this.OPENAI_API_KEY !== 'PASTE_YOUR_OPENAI_API_KEY_HERE');
  },
  
  // Set API key directly (for when env var is stuck)
  setOpenAIKey(key: string) {
    this.OPENAI_API_KEY = key;
  },
  
  // Set other service keys
  setServiceKey(keyName: string, value: string) {
    (this as any)[keyName] = value;
  },
  
  // Get current configuration status
  getStatus() {
    return {
      OPENAI_API_KEY: {
        configured: this.hasValidOpenAIKey(),
        length: this.OPENAI_API_KEY.length
      },
      GOOGLE_SERVICE_ACCOUNT_KEY: {
        configured: Boolean(this.GOOGLE_SERVICE_ACCOUNT_KEY && this.GOOGLE_SERVICE_ACCOUNT_KEY.length > 10),
        length: this.GOOGLE_SERVICE_ACCOUNT_KEY.length
      },
      MICROSOFT_ACCESS_TOKEN: {
        configured: Boolean(this.MICROSOFT_ACCESS_TOKEN && this.MICROSOFT_ACCESS_TOKEN.length > 10),
        length: this.MICROSOFT_ACCESS_TOKEN.length
      },
      DROPBOX_ACCESS_TOKEN: {
        configured: Boolean(this.DROPBOX_ACCESS_TOKEN && this.DROPBOX_ACCESS_TOKEN.length > 10),
        length: this.DROPBOX_ACCESS_TOKEN.length
      }
    };
  }
};