import express from 'express';
import { config } from '../config';

const router = express.Router();

// Available secrets with their validation logic
const secretValidators = {
  'OPENAI_API_KEY': (value: string) => {
    return value.startsWith('sk-') && value.length > 20;
  },
  'GOOGLE_SERVICE_ACCOUNT_KEY': (value: string) => {
    try {
      const parsed = JSON.parse(value);
      return parsed.type === 'service_account' && parsed.client_email;
    } catch {
      return false;
    }
  },
  'MICROSOFT_ACCESS_TOKEN': (value: string) => {
    return value.length > 50; // Basic length check
  },
  'DROPBOX_ACCESS_TOKEN': (value: string) => {
    return value.startsWith('sl.') || value.length > 20;
  }
};

// Get status of all secrets
router.get('/status', async (req, res) => {
  try {
    const secrets: Record<string, any> = {};
    
    // Check each secret
    for (const [key, validator] of Object.entries(secretValidators)) {
      let value = '';
      let isValid = false;
      
      // Get value from config or environment
      if (key === 'OPENAI_API_KEY') {
        value = config.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
      } else {
        value = process.env[key] || '';
      }
      
      if (value && value !== 'PASTE_YOUR_OPENAI_API_KEY_HERE') {
        isValid = validator(value);
      }
      
      secrets[key] = {
        isValid,
        hasValue: Boolean(value && value !== 'PASTE_YOUR_OPENAI_API_KEY_HERE'),
        lastTested: isValid ? new Date().toISOString() : undefined
      };
    }
    
    res.json({
      success: true,
      secrets
    });
  } catch (error) {
    console.error('Error checking secrets status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check secrets status'
    });
  }
});

// Update a secret
router.post('/update', async (req, res) => {
  try {
    const { key, value } = req.body;
    
    if (!key || typeof value !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid key or value'
      });
    }
    
    if (!secretValidators[key as keyof typeof secretValidators]) {
      return res.status(400).json({
        success: false,
        error: 'Unknown secret key'
      });
    }
    
    // Update the config for OPENAI_API_KEY
    if (key === 'OPENAI_API_KEY') {
      config.setOpenAIKey(value);
    }
    
    // For other secrets, we would typically update environment variables
    // but in this case we'll store them in our config system too
    (config as any)[key] = value;
    
    res.json({
      success: true,
      message: `${key} updated successfully`
    });
    
  } catch (error) {
    console.error('Error updating secret:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update secret'
    });
  }
});

// Test a secret
router.post('/test', async (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'Secret key is required'
      });
    }
    
    const validator = secretValidators[key as keyof typeof secretValidators];
    if (!validator) {
      return res.status(400).json({
        success: false,
        error: 'Unknown secret key'
      });
    }
    
    let value = '';
    if (key === 'OPENAI_API_KEY') {
      value = config.OPENAI_API_KEY;
    } else {
      value = (config as any)[key] || process.env[key] || '';
    }
    
    if (!value || value === 'PASTE_YOUR_OPENAI_API_KEY_HERE') {
      return res.json({
        success: false,
        error: 'Secret not configured'
      });
    }
    
    // Basic validation
    const isValid = validator(value);
    if (!isValid) {
      return res.json({
        success: false,
        error: 'Secret format is invalid'
      });
    }
    
    // For OpenAI, test with actual API call
    if (key === 'OPENAI_API_KEY') {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${value}`
          }
        });
        
        if (response.ok) {
          return res.json({
            success: true,
            message: 'OpenAI API key is working correctly'
          });
        } else {
          return res.json({
            success: false,
            error: 'OpenAI API key test failed - invalid or expired'
          });
        }
      } catch (error) {
        return res.json({
          success: false,
          error: 'Failed to test OpenAI API key'
        });
      }
    }
    
    // For other secrets, just validate format for now
    res.json({
      success: true,
      message: `${key} format is valid`
    });
    
  } catch (error) {
    console.error('Error testing secret:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test secret'
    });
  }
});

// Get a specific secret value (internal use only)
router.post('/get', (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({ success: false, error: 'Key is required' });
    }

    // Get value from config system (where secrets are actually stored)
    let value = '';
    if (key === 'OPENAI_API_KEY') {
      value = (config as any).OPENAI_API_KEY || '';
    } else {
      value = (config as any)[key] || process.env[key] || '';
    }
    
    if (!value || value === 'PASTE_YOUR_OPENAI_API_KEY_HERE') {
      return res.status(404).json({ success: false, error: 'Secret not found' });
    }

    res.json({ success: true, value });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve secret' });
  }
});

export default router;