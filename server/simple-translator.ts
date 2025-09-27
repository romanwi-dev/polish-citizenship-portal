import type { Express } from "express";
import { ocrService } from "./ocr-service";
import multer from 'multer';
import { randomUUID } from "crypto";
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

class SimpleTranslator {
  async translateToPolish(text: string): Promise<string> {
    try {
      if (!text || text.trim().length === 0) {
        return 'No text to translate';
      }

      console.log('Translating text to Polish, length:', text.length);

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `Please translate the following text to Polish. If the text is already in Polish, return it as is. Preserve the structure and formatting of the original text.

Text to translate:
${text}`
        }]
      });

      const translatedText = response.content[0].type === 'text' ? response.content[0].text : 'Translation failed';
      console.log('Translation completed, output length:', translatedText.length);
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return `Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

export const simpleTranslator = new SimpleTranslator();

// Simple in-memory storage for uploaded files
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export function registerSimpleTranslatorRoutes(app: Express) {
  
  // Simple OCR + Translation endpoint using direct file upload
  app.post("/api/translator/ocr", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      console.log(`Processing uploaded file: ${req.file.originalname}, size: ${req.file.size} bytes`);

      // Convert buffer to base64 data URL
      const base64Data = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      // Process with OCR
      const ocrResult = await ocrService.processDocument(dataUrl);
      
      console.log(`OCR completed for ${req.file.originalname}`);

      // Return extracted text and structured data
      res.json({
        success: true,
        extractedText: ocrResult.extractedText,
        confidence: ocrResult.confidence,
        documentType: ocrResult.documentType,
        structuredData: ocrResult.structuredData
      });

    } catch (error) {
      console.error("OCR processing failed:", error);
      res.status(500).json({ 
        error: "OCR processing failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
}