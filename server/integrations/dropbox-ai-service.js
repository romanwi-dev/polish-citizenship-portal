import { getUncachableDropboxClient, withFreshClient, isDropboxReady } from "./dropbox-client.js";

/**
 * Dropbox AI Service - Provides AI agent methods for file management
 * Uses fresh client connections to ensure reliable operation
 */
export class DropboxAIService {
  
  /**
   * Normalize path for Dropbox API
   * @param {string} path - File or folder path
   * @returns {string} Normalized path
   */
  static normalizePath(path) {
    if (!path || path === '/') return '';
    let normalized = String(path).trim().replace(/\\+/g, '/');
    if (!normalized.startsWith('/')) normalized = '/' + normalized;
    return normalized.replace(/\/+/g, '/');
  }

  /**
   * Validate path for security
   * @param {string} path - Path to validate
   * @returns {boolean} True if path is valid
   */
  static isValidPath(path) {
    if (!path) return false;
    const normalized = this.normalizePath(path);
    return normalized.length > 0 && !/[<>:"|?*]/.test(normalized);
  }

  /**
   * List all files and folders in a directory
   * @param {string} folderPath - Folder path to list (default: root)
   * @returns {Promise<Object>} List of files and folders
   */
  static async listFiles(folderPath = '') {
    if (!await isDropboxReady()) {
      throw new Error('Dropbox not configured or accessible');
    }

    const path = this.normalizePath(folderPath);
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[dropbox-ai] Listing files in: ${path || '/'}`);  
    }

    return withFreshClient(async (dbx) => {
      try {
        const result = await dbx.filesListFolder({ 
          path: path || '',
          recursive: false,
          include_media_info: true,
          include_deleted: false,
          include_has_explicit_shared_members: false
        });

        const files = result.result.entries.map(entry => ({
          name: entry.name,
          path: entry.path_display,
          type: entry['.tag'], // file or folder
          size: entry.size || 0,
          modified: entry.server_modified || entry.client_modified,
          id: entry.id,
          isFolder: entry['.tag'] === 'folder'
        }));

        if (process.env.NODE_ENV !== 'production') {
          console.debug(`[dropbox-ai] Found ${files.length} items in: [REDACTED]`);
        }
        return {
          success: true,
          path: path || '/',
          files,
          count: files.length
        };

      } catch (error) {
        console.error('[dropbox-ai] List files error:', error.message);
        throw new Error(`Failed to list files: ${error.message}`);
      }
    });
  }

  /**
   * Read file content as text
   * @param {string} filePath - Path to file
   * @returns {Promise<Object>} File content and metadata
   */
  static async readFile(filePath) {
    if (!await isDropboxReady()) {
      throw new Error('Dropbox not configured or accessible');
    }

    if (!this.isValidPath(filePath)) {
      throw new Error('Invalid file path');
    }

    const path = this.normalizePath(filePath);
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[dropbox-ai] Reading file: ${path}`);
    }

    return withFreshClient(async (dbx) => {
      try {
        const result = await dbx.filesDownload({ path });
        const fileBuffer = result.result.fileBinary;
        const metadata = {
          name: result.result.name,
          path: result.result.path_display,
          size: result.result.size,
          modified: result.result.server_modified || result.result.client_modified,
          id: result.result.id
        };

        // Convert buffer to text (assuming UTF-8 encoding)
        const content = fileBuffer.toString('utf8');

        if (process.env.NODE_ENV !== 'production') {
          console.debug(`[dropbox-ai] Read file: [REDACTED] (${metadata.size} bytes)`);
        }
        return {
          success: true,
          content,
          metadata,
          encoding: 'utf8'
        };

      } catch (error) {
        console.error('[dropbox-ai] Read file error:', error.message);
        throw new Error(`Failed to read file: ${error.message}`);
      }
    });
  }

  /**
   * Write/update file content
   * @param {string} filePath - Path to file
   * @param {string} content - File content to write
   * @param {boolean} overwrite - Whether to overwrite existing file (default: true)
   * @returns {Promise<Object>} Upload result
   */
  static async writeFile(filePath, content, overwrite = true) {
    if (!await isDropboxReady()) {
      throw new Error('Dropbox not configured or accessible');
    }

    if (!this.isValidPath(filePath)) {
      throw new Error('Invalid file path');
    }

    const path = this.normalizePath(filePath);
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[dropbox-ai] Writing file: ${path}`);
    }

    return withFreshClient(async (dbx) => {
      try {
        const contents = Buffer.from(content, 'utf8');
        const mode = overwrite ? { '.tag': 'overwrite' } : { '.tag': 'add' };

        const result = await dbx.filesUpload({
          path,
          contents,
          mode,
          autorename: !overwrite
        });

        if (process.env.NODE_ENV !== 'production') {
          console.debug(`[dropbox-ai] Wrote file: [REDACTED] (${contents.length} bytes)`);
        }
        return {
          success: true,
          path: result.result.path_display,
          size: result.result.size,
          id: result.result.id,
          modified: result.result.server_modified || result.result.client_modified
        };

      } catch (error) {
        console.error('[dropbox-ai] Write file error:', error.message);
        throw new Error(`Failed to write file: ${error.message}`);
      }
    });
  }

  /**
   * Create a new folder
   * @param {string} folderPath - Path for new folder
   * @param {boolean} autoRename - Auto-rename if folder exists (default: false)
   * @returns {Promise<Object>} Folder creation result
   */
  static async createFolder(folderPath, autoRename = false) {
    if (!await isDropboxReady()) {
      throw new Error('Dropbox not configured or accessible');
    }

    if (!this.isValidPath(folderPath)) {
      throw new Error('Invalid folder path');
    }

    const path = this.normalizePath(folderPath);
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[dropbox-ai] Creating folder: ${path}`);
    }

    return withFreshClient(async (dbx) => {
      try {
        const result = await dbx.filesCreateFolderV2({
          path,
          autorename: autoRename
        });

        if (process.env.NODE_ENV !== 'production') {
          console.debug(`[dropbox-ai] Created folder: [REDACTED]`);
        }
        return {
          success: true,
          path: result.result.metadata.path_display,
          id: result.result.metadata.id,
          name: result.result.metadata.name
        };

      } catch (error) {
        // Handle folder already exists error
        if (error.error && error.error.error_summary && 
            error.error.error_summary.includes('path/conflict/folder')) {
          if (process.env.NODE_ENV !== 'production') {
            console.debug(`[dropbox-ai] Folder already exists: [REDACTED]`);
          }
          return {
            success: true,
            path,
            message: 'Folder already exists',
            alreadyExists: true
          };
        }

        console.error('[dropbox-ai] Create folder error:', error.message);
        throw new Error(`Failed to create folder: ${error.message}`);
      }
    });
  }

  /**
   * Delete a file or folder
   * @param {string} filePath - Path to file or folder
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteFile(filePath) {
    if (!await isDropboxReady()) {
      throw new Error('Dropbox not configured or accessible');
    }

    if (!this.isValidPath(filePath)) {
      throw new Error('Invalid file path');
    }

    const path = this.normalizePath(filePath);
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[dropbox-ai] Deleting: ${path}`);
    }

    return withFreshClient(async (dbx) => {
      try {
        const result = await dbx.filesDeleteV2({ path });

        if (process.env.NODE_ENV !== 'production') {
          console.debug(`[dropbox-ai] Deleted: [REDACTED]`);
        }
        return {
          success: true,
          path,
          deleted: true,
          metadata: result.result.metadata
        };

      } catch (error) {
        console.error('[dropbox-ai] Delete file error:', error.message);
        throw new Error(`Failed to delete file: ${error.message}`);
      }
    });
  }

  /**
   * Search for files by name or content
   * @param {string} query - Search query
   * @param {string} folderPath - Folder to search in (default: root)
   * @param {number} maxResults - Maximum results to return (default: 100)
   * @returns {Promise<Object>} Search results
   */
  static async searchFiles(query, folderPath = '', maxResults = 100) {
    if (!await isDropboxReady()) {
      throw new Error('Dropbox not configured or accessible');
    }

    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required');
    }

    const path = this.normalizePath(folderPath);
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[dropbox-ai] Searching for "${query}" in: [REDACTED]`);
    }

    return withFreshClient(async (dbx) => {
      try {
        const result = await dbx.filesSearchV2({
          query: query.trim(),
          options: {
            path: path || '',
            max_results: Math.min(maxResults, 1000),
            file_status: 'active',
            filename_only: false
          }
        });

        const files = result.result.matches.map(match => ({
          name: match.metadata.metadata.name,
          path: match.metadata.metadata.path_display,
          type: match.metadata.metadata['.tag'],
          size: match.metadata.metadata.size || 0,
          modified: match.metadata.metadata.server_modified || match.metadata.metadata.client_modified,
          id: match.metadata.metadata.id,
          isFolder: match.metadata.metadata['.tag'] === 'folder',
          matchType: match.match_type ? match.match_type['.tag'] : 'filename'
        }));

        if (process.env.NODE_ENV !== 'production') {
          console.debug(`[dropbox-ai] Found ${files.length} matches for "${query}"`);
        }
        return {
          success: true,
          query,
          searchPath: path || '/',
          files,
          count: files.length,
          hasMore: result.result.has_more || false
        };

      } catch (error) {
        console.error('[dropbox-ai] Search files error:', error.message);
        throw new Error(`Failed to search files: ${error.message}`);
      }
    });
  }

  /**
   * Get file/folder metadata without downloading
   * @param {string} path - Path to file or folder
   * @returns {Promise<Object>} Metadata
   */
  static async getMetadata(path) {
    if (!await isDropboxReady()) {
      throw new Error('Dropbox not configured or accessible');
    }

    if (!this.isValidPath(path)) {
      throw new Error('Invalid path');
    }

    const normalizedPath = this.normalizePath(path);
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[dropbox-ai] Getting metadata for: ${normalizedPath}`);
    }

    return withFreshClient(async (dbx) => {
      try {
        const result = await dbx.filesGetMetadata({ path: normalizedPath });
        const metadata = result.result;

        return {
          success: true,
          name: metadata.name,
          path: metadata.path_display,
          type: metadata['.tag'],
          size: metadata.size || 0,
          modified: metadata.server_modified || metadata.client_modified,
          id: metadata.id,
          isFolder: metadata['.tag'] === 'folder'
        };

      } catch (error) {
        console.error('[dropbox-ai] Get metadata error:', error.message);
        throw new Error(`Failed to get metadata: ${error.message}`);
      }
    });
  }
}