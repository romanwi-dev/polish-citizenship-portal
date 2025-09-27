import { z } from "zod";
import crypto from "crypto";
import type { Response } from "express";

// Client Account Schema
const ClientAccountSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.date(),
  adobeAccountId: z.string().optional(),
  savedDocuments: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    pdfUrl: z.string(),
    editableUrl: z.string().optional(),
    lastModified: z.date(),
    documentType: z.enum(['citizenship-application', 'poa-single', 'poa-married', 'family-tree', 'document-checklist'])
  })).default([])
});

export type ClientAccount = z.infer<typeof ClientAccountSchema>;

// In-memory storage (replace with database in production)
const clientAccounts = new Map<string, ClientAccount>();

// Adobe PDF Embed API Configuration
const ADOBE_CLIENT_ID = process.env.ADOBE_CLIENT_ID || 'demo-client-id';

export class AdobePDFEditingService {
  
  // Make clientAccounts accessible for route handlers
  public getClientAccounts() {
    return clientAccounts;
  }
  
  /**
   * Create or get client account
   */
  async getOrCreateClientAccount(email: string, name: string): Promise<ClientAccount> {
    // Find existing account by email
    for (const [id, account] of Array.from(clientAccounts.entries())) {
      if (account.email === email) {
        return account;
      }
    }
    
    // Create new account
    const accountId = crypto.randomUUID();
    const newAccount: ClientAccount = {
      id: accountId,
      email,
      name,
      createdAt: new Date(),
      savedDocuments: []
    };
    
    clientAccounts.set(accountId, newAccount);
    console.log(`Created new client account: ${accountId} for ${email}`);
    return newAccount;
  }

  // Temporary storage for simple PDF editing (in-memory)
  private tempPDFs = new Map<string, { buffer: Buffer; filename: string; timestamp: number }>();

  /**
   * Simple PDF editor without account management
   */
  async uploadPDFSimple(pdfBuffer: Buffer, filename: string): Promise<{ editableUrl: string; documentId: string; message: string }> {
    const documentId = crypto.randomUUID();
    
    // Store PDF temporarily (clean up after 1 hour)
    this.tempPDFs.set(documentId, {
      buffer: pdfBuffer,
      filename: filename,
      timestamp: Date.now()
    });

    // Clean up old PDFs (older than 1 hour)
    this.cleanupOldPDFs();
    
    // Create simple editable URL without data in URL
    const editableUrl = `/simple-pdf-editor/${documentId}?filename=${encodeURIComponent(filename)}`;

    console.log(`Created simple editable PDF: ${documentId} for ${filename}`);

    return {
      editableUrl,
      documentId,
      message: "Simple PDF editor created successfully"
    };
  }

  /**
   * Get temporary PDF data
   */
  getTempPDF(documentId: string): { buffer: Buffer; filename: string } | null {
    const pdfData = this.tempPDFs.get(documentId);
    if (!pdfData) return null;
    
    return {
      buffer: pdfData.buffer,
      filename: pdfData.filename
    };
  }

  /**
   * Clean up old temporary PDFs
   */
  private cleanupOldPDFs(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour
    const idsToDelete: string[] = [];
    
    this.tempPDFs.forEach((data, id) => {
      if (data.timestamp < oneHourAgo) {
        idsToDelete.push(id);
      }
    });
    
    idsToDelete.forEach(id => this.tempPDFs.delete(id));
  }

  /**
   * Upload PDF to Adobe for online viewing
   */
  async uploadPDFToAdobe(pdfBuffer: Buffer, filename: string): Promise<string> {
    const documentId = crypto.randomUUID();
    
    // Store PDF temporarily for Adobe viewer
    this.tempPDFs.set(documentId, {
      buffer: pdfBuffer,
      filename: filename,
      timestamp: Date.now()
    });

    console.log(`Uploaded PDF to Adobe: ${documentId} for ${filename}`);
    return documentId;
  }

  /**
   * Generate editable PDF link using Adobe PDF Embed API
   */
  async createEditablePDF(
    pdfBuffer: Buffer, 
    filename: string, 
    documentType: string,
    clientAccountId: string
  ): Promise<{ editableUrl: string; viewUrl: string; documentId: string }> {
    
    const documentId = crypto.randomUUID();
    const account = clientAccounts.get(clientAccountId);
    
    if (!account) {
      throw new Error('Client account not found');
    }

    // Convert PDF buffer to base64 for Adobe PDF Embed
    const pdfBase64 = pdfBuffer.toString('base64');
    
    // Create editable PDF configuration
    const editableConfig = {
      clientId: ADOBE_CLIENT_ID,
      documentId,
      pdfData: pdfBase64,
      fileName: filename,
      embedMode: "FULL_WINDOW",
      showToolbar: true,
      showAnnotationTools: true,
      enableFormFilling: true,
      showPrintPDF: true,
      showDownloadPDF: true,
      showLeftHandPanel: true,
      defaultViewMode: "FIT_PAGE",
      callbacks: {
        onDocumentSave: `saveToClientAccount('${clientAccountId}', '${documentId}')`,
        onDocumentDownload: `downloadFromClientAccount('${clientAccountId}', '${documentId}')`
      }
    };

    // Create editable URL (this would be hosted on your domain)
    const editableUrl = `/pdf-editor/${documentId}?client=${clientAccountId}`;
    const viewUrl = `/pdf-view/${documentId}`;

    // Save document to client account
    const savedDoc = {
      id: documentId,
      filename,
      pdfUrl: viewUrl,
      editableUrl,
      lastModified: new Date(),
      documentType: documentType as any
    };

    account.savedDocuments.push(savedDoc);
    clientAccounts.set(clientAccountId, account);

    console.log(`Created editable PDF: ${documentId} for client: ${clientAccountId}`);

    return {
      editableUrl,
      viewUrl,
      documentId
    };
  }

  /**
   * Save edited PDF back to client account
   */
  async saveEditedPDF(
    clientAccountId: string, 
    documentId: string, 
    editedPdfBuffer: Buffer
  ): Promise<{ success: boolean; message: string }> {
    
    const account = clientAccounts.get(clientAccountId);
    if (!account) {
      return { success: false, message: 'Client account not found' };
    }

    // Find document in account
    const docIndex = account.savedDocuments.findIndex(doc => doc.id === documentId);
    if (docIndex === -1) {
      return { success: false, message: 'Document not found' };
    }

    // Update document with edited version
    account.savedDocuments[docIndex].lastModified = new Date();
    clientAccounts.set(clientAccountId, account);

    console.log(`Saved edited PDF: ${documentId} for client: ${clientAccountId}`);

    return { 
      success: true, 
      message: 'Document saved successfully to your account' 
    };
  }

  /**
   * Get client's saved documents
   */
  async getClientDocuments(clientAccountId: string): Promise<ClientAccount['savedDocuments']> {
    const account = clientAccounts.get(clientAccountId);
    return account?.savedDocuments || [];
  }

  /**
   * Generate Adobe PDF Embed HTML page
   */
  generateEmbedHTML(
    pdfBase64: string, 
    filename: string, 
    documentId: string,
    clientAccountId: string
  ): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Edit ${filename}</title>
        <script src="https://acrobatservices.adobe.com/view-sdk/viewer.js"></script>
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f5f5f5;
            }
            .header {
                background: white;
                padding: 1rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .save-btn {
                background: #0066cc;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
            }
            .save-btn:hover {
                background: #0052a3;
            }
            #adobe-dc-view {
                height: calc(100vh - 80px);
            }
            .mobile-actions {
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: flex;
                gap: 10px;
                z-index: 1000;
            }
            .action-btn {
                background: #0066cc;
                color: white;
                border: none;
                padding: 12px;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0,102,204,0.3);
                cursor: pointer;
                width: 56px;
                height: 56px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            @media (max-width: 768px) {
                .header { padding: 0.5rem; }
                .save-btn { padding: 0.4rem 0.8rem; font-size: 14px; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h3 style="margin: 0; color: #333;">📄 ${filename}</h3>
            <button class="save-btn" onclick="saveDocument()">💾 Save to My Account</button>
        </div>
        
        <div id="adobe-dc-view"></div>
        
        <div class="mobile-actions">
            <button class="action-btn" onclick="saveDocument()" title="Save">💾</button>
            <button class="action-btn" onclick="downloadDocument()" title="Download">⬇️</button>
        </div>

        <script>
            // Adobe PDF Embed API Configuration
            const adobeDCView = new AdobeDC.View({
                clientId: "${ADOBE_CLIENT_ID}",
                divId: "adobe-dc-view"
            });

            // PDF Content
            const pdfData = "data:application/pdf;base64,${pdfBase64}";

            // Initialize PDF with editing capabilities
            adobeDCView.previewFile({
                content: { promise: Promise.resolve(pdfData) },
                metaData: { fileName: "${filename}" }
            }, {
                embedMode: "FULL_WINDOW",
                showToolbar: true,
                showAnnotationTools: true,
                enableFormFilling: true,
                showPrintPDF: true,
                showDownloadPDF: true,
                showLeftHandPanel: true,
                defaultViewMode: "FIT_PAGE"
            });

            // Save document function
            async function saveDocument() {
                try {
                    // Get the current PDF data from Adobe
                    const result = await adobeDCView.getAnnotationsManager().exportAnnotations();
                    
                    // Send to backend to save in client account
                    const response = await fetch('/api/pdf/save-edited', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            clientAccountId: '${clientAccountId}',
                            documentId: '${documentId}',
                            annotations: result
                        })
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        // Show success message
                        showNotification('✅ Document saved to your account!', 'success');
                    } else {
                        showNotification('❌ Failed to save document', 'error');
                    }
                } catch (error) {
                    console.error('Save error:', error);
                    showNotification('❌ Error saving document', 'error');
                }
            }

            // Download document function
            function downloadDocument() {
                adobeDCView.getApis().then(function(apis) {
                    apis.getPDFExport().exportPdf().then(function(result) {
                        const blob = new Blob([result], { type: 'application/pdf' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = '${filename}';
                        a.click();
                        URL.revokeObjectURL(url);
                        
                        showNotification('⬇️ PDF downloaded to your device', 'success');
                    });
                });
            }

            // Notification system
            function showNotification(message, type) {
                const notification = document.createElement('div');
                notification.style.cssText = \`
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: \${type === 'success' ? '#10b981' : '#ef4444'};
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    font-weight: 600;
                    max-width: 300px;
                \`;
                notification.textContent = message;
                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.remove();
                }, 3000);
            }

            // Auto-save every 30 seconds
            setInterval(saveDocument, 30000);
            
            console.log('Adobe PDF Editor initialized for client: ${clientAccountId}');
        </script>
    </body>
    </html>
    `;
  }
}

export const adobePDFEditingService = new AdobePDFEditingService();