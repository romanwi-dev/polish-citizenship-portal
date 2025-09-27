// Email Templates Data
import type { EmailTemplate } from '@/types/emailTemplates';

const TEMPLATES: EmailTemplate[] = [
  {
    id: 'accelerated-path',
    name: 'Accelerated Path to Polish Citizenship',
    tags: ['VIP', 'Acceleration'],
    html: '<!-- TODO: replace with my corrected content -->',
    text: 'TODO plain text',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'welcome-account',
    name: 'Welcome to Your Account',
    tags: ['Welcome', 'Account'],
    html: '<!-- TODO: replace with my corrected content -->',
    text: 'TODO plain text',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'passport-next-steps',
    name: 'Polish Passport Next Steps',
    tags: ['Passport', 'Process'],
    html: '<!-- TODO: replace with my corrected content -->',
    text: 'TODO plain text',
    lastUpdated: new Date().toISOString()
  }
];

export default TEMPLATES;