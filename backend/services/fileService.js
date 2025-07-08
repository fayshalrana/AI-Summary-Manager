const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

class FileService {
  /**
   * Extract text from uploaded file
   * @param {Object} file - Uploaded file object
   * @returns {Promise<Object>} - Extracted text and metadata
   */
  async extractTextFromFile(file) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      const fileExtension = path.extname(file.originalname).toLowerCase();
      let extractedText = '';
      let metadata = {
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        extension: fileExtension
      };

      switch (fileExtension) {
        case '.txt':
          extractedText = await this.extractFromTxt(file);
          break;
        case '.docx':
          extractedText = await this.extractFromDocx(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileExtension}. Supported types: .txt, .docx`);
      }

      // Validate extracted text
      const validation = this.validateExtractedText(extractedText);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      return {
        success: true,
        text: extractedText,
        metadata: {
          ...metadata,
          wordCount: validation.wordCount,
          characterCount: extractedText.length
        }
      };
    } catch (error) {
      console.error('File extraction error:', error);
      throw error;
    }
  }

  /**
   * Extract text from .txt file
   * @param {Object} file - Uploaded file object
   * @returns {Promise<string>} - Extracted text
   */
  async extractFromTxt(file) {
    try {
      const text = file.buffer.toString('utf8');
      return text.trim();
    } catch (error) {
      throw new Error(`Failed to read TXT file: ${error.message}`);
    }
  }

  /**
   * Extract text from .docx file
   * @param {Object} file - Uploaded file object
   * @returns {Promise<string>} - Extracted text
   */
  async extractFromDocx(file) {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value.trim();
    } catch (error) {
      throw new Error(`Failed to read DOCX file: ${error.message}`);
    }
  }

  /**
   * Validate extracted text
   * @param {string} text - Extracted text
   * @returns {Object} - Validation result
   */
  validateExtractedText(text) {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: 'No text content found in file' };
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      return { valid: false, error: 'File appears to be empty' };
    }

    if (trimmedText.length > 50000) {
      return { valid: false, error: 'File content exceeds 50,000 characters limit' };
    }

    const wordCount = trimmedText.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 10) {
      return { valid: false, error: 'File must contain at least 10 words for meaningful summarization' };
    }

    return { valid: true, wordCount };
  }

  /**
   * Get supported file types
   * @returns {Array} - Supported file types
   */
  getSupportedFileTypes() {
    return [
      {
        extension: '.txt',
        mimeType: 'text/plain',
        name: 'Plain Text File',
        maxSize: '5MB'
      },
      {
        extension: '.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        name: 'Microsoft Word Document',
        maxSize: '10MB'
      }
    ];
  }

  /**
   * Validate file before processing
   * @param {Object} file - Uploaded file object
   * @returns {Object} - Validation result
   */
  validateFile(file) {
    if (!file) {
      return { valid: false, error: 'No file uploaded' };
    }

    const supportedTypes = this.getSupportedFileTypes();
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const supportedType = supportedTypes.find(type => type.extension === fileExtension);

    if (!supportedType) {
      return { 
        valid: false, 
        error: `Unsupported file type: ${fileExtension}. Supported types: ${supportedTypes.map(t => t.extension).join(', ')}` 
      };
    }

    // Check file size (5MB for txt, 10MB for docx)
    const maxSize = fileExtension === '.txt' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size too large. Maximum size for ${fileExtension} files is ${maxSize / (1024 * 1024)}MB` 
      };
    }

    return { valid: true, supportedType };
  }

  /**
   * Clean and normalize text
   * @param {string} text - Raw text
   * @returns {string} - Cleaned text
   */
  cleanText(text) {
    if (!text) return '';

    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')   // Convert remaining carriage returns
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/\s+/g, ' ')   // Normalize whitespace
      .trim();
  }
}

module.exports = new FileService(); 