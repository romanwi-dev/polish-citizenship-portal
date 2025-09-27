// API Document Ingest Tests
// Tests MRZ parsing, birth certificate processing, and document ingestion

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes.ts';
import { testUtils } from './setup.mjs';

describe('Document Ingest API Tests', () => {
  let app;
  let server;
  let request;

  beforeAll(async () => {
    app = express();
    server = await registerRoutes(app);
    request = supertest(app);
  });

  afterAll(async () => {
    if (server && typeof server.close === 'function') {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('Document OCR Processing', () => {
    it('should process document with OCR', async () => {
      const mockPdfBuffer = testUtils.createMockFile('passport.pdf');

      const response = await request
        .post('/api/docs/ocr')
        .attach('document', mockPdfBuffer, 'passport.pdf')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('extractedText');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('processingTime');
      expect(typeof response.body.extractedText).toBe('string');
    });

    it('should handle unsupported file types', async () => {
      const mockTextBuffer = Buffer.from('This is not an image or PDF');

      await request
        .post('/api/docs/ocr')
        .attach('document', mockTextBuffer, 'document.txt')
        .expect(400);
    });

    it('should process multiple document types', async () => {
      const fileTypes = [
        { buffer: testUtils.createMockFile('passport.pdf'), name: 'passport.pdf' },
        { buffer: testUtils.createMockFile('birth.jpg'), name: 'birth.jpg' },
        { buffer: testUtils.createMockFile('marriage.png'), name: 'marriage.png' }
      ];

      for (const file of fileTypes) {
        const response = await request
          .post('/api/docs/ocr')
          .attach('document', file.buffer, file.name)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('extractedText');
      }
    });

    it('should return confidence scores', async () => {
      const mockDocument = testUtils.createMockFile('clear_document.pdf');

      const response = await request
        .post('/api/docs/ocr')
        .attach('document', mockDocument, 'clear_document.pdf')
        .expect(200);

      expect(response.body).toHaveProperty('confidence');
      expect(response.body.confidence).toBeGreaterThanOrEqual(0);
      expect(response.body.confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('MRZ (Machine Readable Zone) Parsing', () => {
    it('should parse MRZ from passport document', async () => {
      const mockPassportText = `
        P<POLKOWALSKI<<ANNA<<<<<<<<<<<<<<<<<<<<<<
        EE12345678POL9001011F2712315123456789012
      `;

      const response = await request
        .post('/api/docs/parse-mrz')
        .send({ extractedText: mockPassportText })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('mrzData');
      expect(response.body.mrzData).toHaveProperty('documentType', 'P');
      expect(response.body.mrzData).toHaveProperty('issuingCountry', 'POL');
      expect(response.body.mrzData).toHaveProperty('surname', 'KOWALSKI');
      expect(response.body.mrzData).toHaveProperty('givenNames', 'ANNA');
      expect(response.body.mrzData).toHaveProperty('documentNumber');
      expect(response.body.mrzData).toHaveProperty('nationality', 'POL');
    });

    it('should parse birth date from MRZ', async () => {
      const mockMrzText = `
        P<POLSMITH<<JOHN<JAMES<<<<<<<<<<<<<<<<<<<
        AB12345679POL9505151M3012311234567890123
      `;

      const response = await request
        .post('/api/docs/parse-mrz')
        .send({ extractedText: mockMrzText })
        .expect(200);

      expect(response.body.mrzData).toHaveProperty('dateOfBirth');
      expect(response.body.mrzData.dateOfBirth).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(response.body.mrzData).toHaveProperty('sex', 'M');
    });

    it('should handle invalid MRZ data', async () => {
      const invalidMrzText = 'This is not MRZ data';

      const response = await request
        .post('/api/docs/parse-mrz')
        .send({ extractedText: invalidMrzText })
        .expect(200);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('MRZ');
    });

    it('should validate MRZ check digits', async () => {
      // MRZ with incorrect check digits
      const invalidMrzText = `
        P<POLKOWALSKI<<ANNA<<<<<<<<<<<<<<<<<<<<<<
        EE12345670POL9001011F2712315123456789012
      `;

      const response = await request
        .post('/api/docs/parse-mrz')
        .send({ extractedText: invalidMrzText })
        .expect(200);

      if (response.body.success) {
        expect(response.body.mrzData).toHaveProperty('checkDigitValid');
        expect(response.body.mrzData.checkDigitValid).toBe(false);
      }
    });
  });

  describe('Birth Certificate Processing', () => {
    it('should extract birth information from certificate', async () => {
      const mockBirthCertText = `
        ORYGINAŁ ODPISU SKRÓCONEGO AKTU URODZENIA
        
        Imię i nazwisko: Jan Kowalski
        Data urodzenia: 15 maja 1990 roku
        Miejsce urodzenia: Warszawa
        Imię i nazwisko ojca: Piotr Kowalski
        Imię i nazwisko matki: Maria Kowalska z domu Nowak
        
        USC Warszawa-Śródmieście
      `;

      const response = await request
        .post('/api/docs/parse-birth-certificate')
        .send({ 
          extractedText: mockBirthCertText,
          language: 'pl' 
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('birthData');
      expect(response.body.birthData).toHaveProperty('fullName', 'Jan Kowalski');
      expect(response.body.birthData).toHaveProperty('birthDate');
      expect(response.body.birthData).toHaveProperty('birthPlace', 'Warszawa');
      expect(response.body.birthData).toHaveProperty('fatherName', 'Piotr Kowalski');
      expect(response.body.birthData).toHaveProperty('motherName', 'Maria Kowalska z domu Nowak');
    });

    it('should handle English birth certificates', async () => {
      const mockEnglishBirthText = `
        CERTIFIED COPY OF BIRTH CERTIFICATE
        
        Full Name: John Smith
        Date of Birth: May 15, 1990
        Place of Birth: London, England
        Father's Name: Michael Smith
        Mother's Name: Sarah Smith née Johnson
      `;

      const response = await request
        .post('/api/docs/parse-birth-certificate')
        .send({ 
          extractedText: mockEnglishBirthText,
          language: 'en' 
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.birthData).toHaveProperty('fullName', 'John Smith');
      expect(response.body.birthData).toHaveProperty('birthPlace', 'London, England');
    });

    it('should extract dates in various formats', async () => {
      const dateFormats = [
        { text: 'Data urodzenia: 15.05.1990', expected: '1990-05-15' },
        { text: 'Born: May 15, 1990', expected: '1990-05-15' },
        { text: 'Date of Birth: 15/05/1990', expected: '1990-05-15' }
      ];

      for (const format of dateFormats) {
        const response = await request
          .post('/api/docs/parse-birth-certificate')
          .send({ extractedText: format.text })
          .expect(200);

        if (response.body.success && response.body.birthData.birthDate) {
          expect(response.body.birthData.birthDate).toBe(format.expected);
        }
      }
    });
  });

  describe('Document Field Mapping', () => {
    it('should map document fields to OBY form', async () => {
      const documentData = {
        fullName: 'Jan Kowalski',
        birthDate: '1990-05-15',
        birthPlace: 'Warszawa, Polska',
        fatherName: 'Piotr Kowalski',
        motherName: 'Maria Kowalska'
      };

      const response = await request
        .post('/api/docs/map')
        .send({ 
          documentData,
          targetForm: 'OBY',
          documentType: 'birth_certificate'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('mappedFields');
      expect(response.body.mappedFields).toHaveProperty('applicant_full_name', 'Jan Kowalski');
      expect(response.body.mappedFields).toHaveProperty('applicant_birth_date', '1990-05-15');
      expect(response.body.mappedFields).toHaveProperty('applicant_birth_place', 'Warszawa, Polska');
      expect(response.body.mappedFields).toHaveProperty('father_full_name', 'Piotr Kowalski');
      expect(response.body.mappedFields).toHaveProperty('mother_full_name', 'Maria Kowalska');
    });

    it('should provide confidence scores for mappings', async () => {
      const documentData = {
        fullName: 'Anna Nowak',
        birthDate: '1985-03-20'
      };

      const response = await request
        .post('/api/docs/map')
        .send({ 
          documentData,
          targetForm: 'OBY'
        })
        .expect(200);

      expect(response.body).toHaveProperty('mappingConfidence');
      expect(response.body.mappingConfidence).toHaveProperty('applicant_full_name');
      expect(response.body.mappingConfidence.applicant_full_name).toBeGreaterThan(0.8);
    });

    it('should handle partial document data', async () => {
      const incompleteData = {
        fullName: 'Partial Data Test'
        // Missing other fields
      };

      const response = await request
        .post('/api/docs/map')
        .send({ 
          documentData: incompleteData,
          targetForm: 'OBY'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('mappedFields');
      expect(response.body).toHaveProperty('unmappedFields');
      expect(Array.isArray(response.body.unmappedFields)).toBe(true);
    });
  });

  describe('Document Quality Assessment', () => {
    it('should assess document image quality', async () => {
      const mockDocument = testUtils.createMockFile('high_quality.pdf');

      const response = await request
        .post('/api/docs/assess-quality')
        .attach('document', mockDocument, 'high_quality.pdf')
        .expect(200);

      expect(response.body).toHaveProperty('qualityScore');
      expect(response.body).toHaveProperty('qualityFactors');
      expect(response.body.qualityScore).toBeGreaterThanOrEqual(0);
      expect(response.body.qualityScore).toBeLessThanOrEqual(100);
      
      expect(response.body.qualityFactors).toHaveProperty('resolution');
      expect(response.body.qualityFactors).toHaveProperty('contrast');
      expect(response.body.qualityFactors).toHaveProperty('skew');
    });

    it('should provide improvement suggestions', async () => {
      const mockPoorQualityDoc = testUtils.createMockFile('poor_quality.jpg');

      const response = await request
        .post('/api/docs/assess-quality')
        .attach('document', mockPoorQualityDoc, 'poor_quality.jpg')
        .expect(200);

      if (response.body.qualityScore < 70) {
        expect(response.body).toHaveProperty('improvements');
        expect(Array.isArray(response.body.improvements)).toBe(true);
        expect(response.body.improvements.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Batch Document Processing', () => {
    it('should process multiple documents in batch', async () => {
      const documents = [
        { buffer: testUtils.createMockFile('doc1.pdf'), name: 'passport.pdf' },
        { buffer: testUtils.createMockFile('doc2.jpg'), name: 'birth_cert.jpg' },
        { buffer: testUtils.createMockFile('doc3.png'), name: 'marriage_cert.png' }
      ];

      const response = await request
        .post('/api/docs/batch-process')
        .attach('documents', documents[0].buffer, documents[0].name)
        .attach('documents', documents[1].buffer, documents[1].name)
        .attach('documents', documents[2].buffer, documents[2].name)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results).toHaveLength(3);

      response.body.results.forEach(result => {
        expect(result).toHaveProperty('filename');
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('extractedText');
      });
    });

    it('should handle mixed success/failure in batch', async () => {
      const mixedDocuments = [
        { buffer: testUtils.createMockFile('valid.pdf'), name: 'valid.pdf' },
        { buffer: Buffer.from('invalid'), name: 'invalid.txt' }
      ];

      const response = await request
        .post('/api/docs/batch-process')
        .attach('documents', mixedDocuments[0].buffer, mixedDocuments[0].name)
        .attach('documents', mixedDocuments[1].buffer, mixedDocuments[1].name)
        .expect(200);

      expect(response.body).toHaveProperty('results');
      const results = response.body.results;
      
      // At least one should succeed, one should fail
      const successes = results.filter(r => r.success);
      const failures = results.filter(r => !r.success);
      
      expect(successes.length).toBeGreaterThan(0);
      expect(failures.length).toBeGreaterThan(0);
    });
  });

  describe('Document Processing Status', () => {
    it('should provide processing status endpoint', async () => {
      const response = await request
        .get('/api/docs/_status')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('ocr');
      expect(response.body.services).toHaveProperty('mrz_parser');
      expect(response.body.services).toHaveProperty('field_mapper');
    });

    it('should track processing statistics', async () => {
      const response = await request
        .get('/api/docs/stats')
        .expect(200);

      expect(response.body).toHaveProperty('totalProcessed');
      expect(response.body).toHaveProperty('successRate');
      expect(response.body).toHaveProperty('averageProcessingTime');
      expect(response.body).toHaveProperty('byDocumentType');
    });
  });
});