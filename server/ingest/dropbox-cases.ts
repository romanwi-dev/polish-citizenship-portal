import { Dropbox } from 'dropbox';
import { getUncachableDropboxClient } from '../integrations/dropbox-client.js';
import { db } from '../db.js';
import { casesIngestQueue } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// HYBRID naming pattern parser
// Expected formats: 
// - ABC123_John_Doe
// - ABC123_John_Doe_john@example.com
// - XYZ789_Sarah_Smith
function parseHybridNaming(folderName: string) {
  const parts = folderName.split('_');
  
  if (parts.length < 2) {
    return {
      caseId: null,
      clientName: null,
      clientEmail: null,
      isValid: false
    };
  }

  // First part should be case ID (alphanumeric)
  const caseId = parts[0];
  if (!/^[A-Z0-9]+$/i.test(caseId)) {
    return {
      caseId: null,
      clientName: null,
      clientEmail: null,
      isValid: false
    };
  }

  // Extract name parts (everything between caseId and potential email)
  let nameParts = parts.slice(1);
  let clientEmail = null;

  // Check if last part looks like an email
  const lastPart = parts[parts.length - 1];
  if (lastPart.includes('@') && lastPart.includes('.')) {
    clientEmail = lastPart;
    nameParts = parts.slice(1, -1); // Remove email from name parts
  }

  const clientName = nameParts.join(' ').replace(/_/g, ' ').trim();

  return {
    caseId,
    clientName: clientName || null,
    clientEmail,
    isValid: true
  };
}

// Calculate content hash for duplicate detection
async function calculateContentHash(fileList: any[]): Promise<string> {
  const content = JSON.stringify(fileList.map(f => ({
    path: f.path_lower,
    size: f.size,
    modified: f.server_modified
  })).sort((a, b) => a.path.localeCompare(b.path)));
  
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Get folder contents from Dropbox
async function getFolderContents(dbx: Dropbox, folderPath: string) {
  try {
    const response = await dbx.filesListFolder({
      path: folderPath,
      recursive: true
    });
    
    return response.result.entries;
  } catch (error: any) {
    if (error.status === 409) {
      // Folder doesn't exist
      return [];
    }
    throw error;
  }
}

// Check if queue item already exists
async function isDuplicate(folderPath: string, contentHash: string): Promise<boolean> {
  const existing = await db
    .select()
    .from(casesIngestQueue)
    .where(
      and(
        eq(casesIngestQueue.folderPath, folderPath),
        eq(casesIngestQueue.contentHash, contentHash)
      )
    )
    .limit(1);
    
  return existing.length > 0;
}

// Scan /CASES folder for new client folders
export async function scanDropboxCases(): Promise<{ processed: number; errors: string[] }> {
  const errors: string[] = [];
  let processed = 0;

  try {
    const dbx = await getUncachableDropboxClient();
    
    // List folders in /CASES
    const casesResponse = await dbx.filesListFolder({
      path: '/CASES'
    });

    const folders = casesResponse.result.entries.filter(
      entry => entry['.tag'] === 'folder'
    );

    for (const folder of folders) {
      try {
        const folderName = folder.name;
        const folderPath = folder.path_lower;
        
        // Parse HYBRID naming
        const parsed = parseHybridNaming(folderName);
        
        if (!parsed.isValid) {
          console.log(`Skipping invalid folder name: ${folderName}`);
          continue;
        }

        // Get folder contents
        const contents = await getFolderContents(dbx, folderPath);
        const fileList = contents.filter(entry => entry['.tag'] === 'file');
        
        // Calculate content hash
        const contentHash = await calculateContentHash(fileList);
        
        // Check for duplicates
        if (await isDuplicate(folderPath, contentHash)) {
          console.log(`Skipping duplicate folder: ${folderName}`);
          continue;
        }

        // Add to ingest queue
        await db.insert(casesIngestQueue).values({
          folderPath,
          folderName,
          caseId: parsed.caseId,
          clientName: parsed.clientName,
          clientEmail: parsed.clientEmail,
          contentHash,
          fileCount: fileList.length,
          fileList: fileList.map(file => ({
            path: file.path_lower,
            name: file.name,
            size: file.size,
            modified: file.server_modified
          }))
        });

        processed++;
        console.log(`Added to ingest queue: ${folderName} (${fileList.length} files)`);
        
      } catch (error: any) {
        const errorMsg = `Error processing folder ${folder.name}: ${error.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

  } catch (error: any) {
    const errorMsg = `Error scanning Dropbox CASES folder: ${error.message}`;
    errors.push(errorMsg);
    console.error(errorMsg);
  }

  return { processed, errors };
}

// Set up periodic polling (every 10 minutes)
let pollingInterval: NodeJS.Timeout | null = null;

export function startDropboxPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }

  // Run immediately, then every 10 minutes
  scanDropboxCases().then(result => {
    console.log(`Initial Dropbox scan completed: ${result.processed} items processed`);
    if (result.errors.length > 0) {
      console.error('Dropbox scan errors:', result.errors);
    }
  });

  pollingInterval = setInterval(async () => {
    try {
      const result = await scanDropboxCases();
      if (result.processed > 0) {
        console.log(`Dropbox polling: ${result.processed} new items processed`);
      }
      if (result.errors.length > 0) {
        console.error('Dropbox polling errors:', result.errors);
      }
    } catch (error) {
      console.error('Error in Dropbox polling:', error);
    }
  }, 10 * 60 * 1000); // 10 minutes

  console.log('✅ Dropbox polling started (10-minute intervals)');
}

export function stopDropboxPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('❌ Dropbox polling stopped');
  }
}

// Manual trigger for immediate sync
export async function triggerManualSync(): Promise<{ processed: number; errors: string[] }> {
  console.log('🔄 Manual Dropbox sync triggered');
  return await scanDropboxCases();
}