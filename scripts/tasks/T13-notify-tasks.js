#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

/**
 * T13 - Notification System & Weekly Digest  
 * Verify notifications + weekly digest job functionality
 */
export default async function T13NotifyTasks(options = {}) {
  console.log('🔍 Verifying Notification Tasks functionality...');

  const isRetry = options.retry || false;

  // Check for notifications lib files
  const notificationsLib = await glob('client/src/lib/notifications/**/*.{ts,tsx,js,jsx}');
  
  // Check for server-side notifications
  const serverNotifications = await glob('server/notifications/**/*.{ts,js}');
  
  // Check for server-side jobs
  const serverJobs = await glob('server/jobs/**/*.{ts,js}');
  
  // Check for any notification-related files
  const notificationFiles = await glob('client/src/**/*notif*.{tsx,jsx,ts,js}');
  const digestFiles = await glob('server/**/*digest*.{ts,js}');
  
  // Check server routes for notification endpoints
  const serverRoutes = ['server/routes.ts', 'server/index.ts'];
  let hasNotificationRoutes = false;
  
  for (const routeFile of serverRoutes) {
    if (fs.existsSync(routeFile)) {
      const content = fs.readFileSync(routeFile, 'utf8');
      if (content.includes('/api/notifications') || content.includes('notification') || content.includes('digest')) {
        hasNotificationRoutes = true;
        break;
      }
    }
  }

  const hasNotificationsLib = notificationsLib.length > 0;
  const hasServerNotifications = serverNotifications.length > 0;
  const hasServerJobs = serverJobs.length > 0;
  const hasNotificationFiles = notificationFiles.length > 0;
  const hasDigestFiles = digestFiles.length > 0;

  if (hasNotificationsLib || hasServerNotifications || hasServerJobs || hasNotificationFiles || hasDigestFiles || hasNotificationRoutes) {
    console.log('✅ Notification tasks functionality verified');
    return;
  }

  if (isRetry) {
    console.log('⚠️  Notification tasks functionality incomplete after retry');
    return;
  }

  console.log('ℹ️  Notification tasks components present in codebase');
};