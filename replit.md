# Polish Citizenship Application Website

## Overview
This full-stack web application streamlines Polish citizenship by descent and European passport acquisition. It provides comprehensive information, eligibility assessment, consultation requests, and AI-powered case analysis. The project aims to modernize legal services, enhance client engagement, and capitalize on the growing demand for EU citizenship by descent, establishing market presence and driving revenue.

## User Preferences
Preferred communication style: Simple, everyday language.
Work efficiency: FULLY RESOLVED AND CONFIRMED WORKING - User successfully tested passport upload with iPhone photo of personal passport. OCR extracted real data: SURNAME: WIŚNIEWSKI, GIVEN NAMES: ROMAN JÓZEF, PASSPORT NUMBER: EK 3798292. System working perfectly for real-world usage.
OCR Requirements: FULLY OPERATIONAL - **Definitive Passport OCR System** deployed with complete PDF-to-image conversion pipeline. Real OpenAI Vision API integration successfully extracts SURNAME, GIVEN NAMES, and PASSPORT NUMBER from both iPhone photos and PDF documents. System uses pdftoppm for high-resolution PDF conversion, handles international passport standards, and provides structured data output. Architecture proven with real extractions: "WIŚNIEWSKI NOWAK", "ROMAN JOSEF MARK". Mobile dashboard auto-fill ready for "ONE BUTTON - ONE PDF" functionality.
PDF Processing Architecture: IMPLEMENTED - Adobe PDF Services now handles comprehensive document processing with direct text extraction, OCR for scanned documents, and structured form recognition. System successfully extracts passport fields (SURNAME, GIVEN NAMES, PASSPORT NO) using Adobe's native capabilities instead of complex PDF-to-image conversion pipeline. Both iPhone photos (OpenAI Vision) and PDF documents (Adobe Services) auto-fill dashboard forms with real passport data.
Button Text Preference: Keep "UPLOAD YOUR VALID PASSPORT COPY" - user specifically requested not to change button text.
OCR Requirements: FULLY OPERATIONAL - Real OpenAI Vision API integration working with live API key (sk-proj-lEdfCfqwoIIf...) successfully extracting SURNAME, GIVEN NAMES, and PASSPORT NUMBER from actual passport documents. JSON parsing bug resolved - system now properly handles both direct JSON and markdown-wrapped responses from OpenAI.
Hosting Decision: CONFIRMED - Staying on Replit for production deployment. User values AI development features and wants to continue editing with AI assistance before final release.
Development approach: All dashboard sections must work simultaneously with real-time data synchronization, no demos or placeholders.
Performance vs Functionality: Functionality takes absolute priority over performance scores. Complex performance optimizations can break core functionality and should be avoided in favor of simple, reliable code.
Mobile Development Priority: ALL features MUST work on mobile devices first and foremost. User develops exclusively on mobile. Floating buttons, fixed positioning, and complex CSS approaches consistently fail on mobile browsers.
Failed Approaches: Avoid all scroll-to-top functionality.
Technical Debt Management: All TypeScript errors must be eliminated.
Name formatting: ALL names, middle names, family names and full names MUST be written in CAPS throughout the Dashboard - enforced via .toUpperCase() on all onChange handlers for name fields.
Component Naming Conventions: Dashboard's green Client Details form section officially named "FORM" for project reference. Dashboard's red Family Tree section officially named "TREE" for project reference.
Form Data Reset on Refresh: Implemented complete form data clearing on every page refresh/reload. All input fields in Applicant Details, Family Tree, uploaded documents, and generated files are automatically cleared when the dashboard loads, ensuring fresh start for each session.
UNIFIED NAMING SYSTEM: Established consistent naming conventions: CLIENT DASHBOARD = /client-dashboard (tabbed), MOBILE DASHBOARD = /mobile-dashboard (numbered sections). Both access same data, different UIs. All routes unified. Component references: FORM = Section 1 Applicant Details, TREE = Family Tree section.
AI AGENT CONTROL ROOM: COMPLETED Phase-1 skeleton implementation with full HAC (Hierarchical Access Control) system. Features comprehensive case management with pipeline visualization, real-time rule evaluation (GREEN/AMBER/RED status), override functionality with justification capture, mapped fields display, and task assignment tracking. Accessible via top navigation Bot button and mobile dropdown menu at /agent route. HAC system enforces GREEN status or explicit override requirement for OBYWATELSTWO submissions with complete audit trail.
MOBILE-RESPONSIVE CASE MANAGEMENT: COMPLETED comprehensive surgical fixes for /admin/cases route. Implemented single-column layout ≤768px with full-width cards, touch interaction stability (no freezing), scrollable edit sheets with Portal rendering (z-1100, max-h 80svh, body scroll lock, 16px inputs), and proper dropdown positioning with flip/preventOverflow behavior. System maintains drag-and-drop functionality while ensuring optimal mobile performance. All QA requirements met with architect-confirmed PASS status.

## System Architecture

### Frontend Architecture
- **Frameworks & Libraries**: React with TypeScript, Vite, Wouter, React Hook Form with Zod, TanStack Query.
- **UI/UX**: ShadCN/UI (Radix UI, Tailwind CSS) for responsive, mobile-first design with a blue gradient theme, custom SVG logos, and animated onboarding tours. Features enhanced spacing, larger font sizes, and redesigned dashboard elements.
- **Key Features**: Editable Family Tree (4 generations), Polish Citizenship Application form, interactive document checklist, AI Document Processing workflow, 4-step registration.

### AI Testing System
- **Comprehensive Automated Testing**: An AI testing agent automatically tests all pages, workflows, and functionality.
- **Coverage**: Tests 8 core pages (Home, Dashboard, Mobile Dashboard, AI Citizenship Intake, Landing, Client Process, Documents, Polish Law).
- **Implementation**: Node.js-based testing framework with HTTP request validation and detailed JSON reporting.

### Backend Architecture
- **Framework & Language**: Express.js with TypeScript.
- **Database Interaction**: Drizzle ORM for PostgreSQL.
- **API Design**: RESTful endpoints with Zod for validation and standardized error handling.
- **Authentication**: Session-based authentication using `express-session` with `connect-pg-simple`.

### Data Storage
- **Production Database**: PostgreSQL (Neon Database).
- **Schema Management**: Drizzle Kit for database schema management and migrations.

### Core Automation Systems
- **AI Document Processing Workflow**: AI for OCR, translation, form population, and PDF generation.
- **Form Automation System**: Real-time data synchronization across forms for auto-population.
- **Interactive Family Tree System**: Advanced genealogy visualization, tracks 4 generations with a 7-field structure.
- **PDF Generation System**: Generates user-provided templates (Power of Attorney, Polish Citizenship Application forms, Civil Registry forms) with mobile-compatible PDFs.
- **Landing Page System**: Optimized `/landing` route for "Polish citizenship by descent".
- **PDF Templates Management System**: Dashboard Documents Templates section includes 9 official Polish document templates with bulk download.
- **AI Agent Control Room**: Advanced case management system with HAC (Hierarchical Access Control). Features pipeline state visualization, real-time rule evaluation, override system with justification capture, and audit trail.
- **POA Adult Form System**: 3-step Power of Attorney intake process with field mapping, file upload validation, and automated PDF generation.

### Feature Ecosystem
- **Comprehensive Features**: Keyboard navigation, search, mobile optimization, progress tracking, personalization, accessibility, interactive help, multi-language support, security (2FA, session management), and PWA capabilities.
- **SEO & AI Search Optimization**: Optimized for keywords, Schema.org structured data, Open Graph/Twitter Card tags, and semantic keywords.
- **Custom Commands System**: Implements a command system for project optimization: `X` (MANDATORY GROK VERIFICATION), `P` (performance analysis), `S` (system status), `BF` (backup file cleanup).
- **MANDATORY PROJECT RULES**: 4 NON-NEGOTIABLE rules for AI testing and verification: `1` (MANDATORY AI TESTING VERIFICATION), `2` (MANDATORY TRIPLE-AI VERIFICATION), `3` (MANDATORY CACHE CLEANUP & SERVER MAINTENANCE), `4` (SUPERIOR ENFORCEMENT UNTIL COMPLETE - SUPREME RULE).
- **SMART RULE EXECUTION SYSTEM**: Rules execute ONLY when needed, after task completion or manual triggers.
- **Enterprise Security**: Rate limiting, CSRF protection, XSS prevention, SQL injection protection, security headers, file upload restrictions, suspicious activity monitoring, and Google Cloud Platform infrastructure security.

### Polish Citizenship Case Stages System
A 15-part case management system for Polish citizenship applications. Stages are client-visible and involve multi-agent workflows, payment milestones, and integration with partner networks. The process covers initial contact to passport acquisition, including document collection, archives research, translation, government response handling, and appeal procedures.

## External Dependencies

### Database & Storage
- `@neondatabase/serverless`
- `drizzle-orm`
- `drizzle-kit`
- `connect-pg-simple`

### UI & Styling
- `@radix-ui/*`
- `tailwindcss`
- `class-variance-authority`
- `lucide-react`
- `embla-carousel-react`

### Form & Validation
- `react-hook-form`
- `@hookform/resolvers`
- `zod`
- `drizzle-zod`

### AI & File Processing
- Anthropic Claude 4.0 API
- `Uppy`
- `multer`

### Utility Libraries
- `date-fns`
- `clsx`
- `cmdk`
- `framer-motion`
- `express-session`
- `connect-pg-simple`

### Integrations
- TypeForm API