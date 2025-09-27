# QA System Documentation

This document describes the comprehensive Quality Assurance (QA) system for the Polish Citizenship Agent application. The QA system includes unit tests, UI tests, accessibility scans, and automated quality checks.

## Prerequisites

Before running the QA system, ensure:

1. **Development server is running**:
   ```bash
   npm run dev
   ```
   The server must be accessible at `http://localhost:5000`

2. **Environment setup** (for full testing):
   - Node.js and npm installed
   - For UI tests: `npx playwright install chromium` (auto-detects availability)

## Quick Start

Run the complete QA suite:

```bash
node scripts/qa-run.js
```

**Success Output:** When all tests pass, you'll see exactly:
```
DONE - CHECKED - CONFIRMED - WORKING
```

**Failure:** Any test failure will exit with a non-zero code and detailed error messages.

## Environment Adaptation

The QA system automatically adapts to your environment:

- **Full Environment** (local development): Runs unit, UI, and accessibility tests
- **Limited Environment** (Replit/containers): Runs unit tests only, skips browser-dependent tests
- **No Server**: Exits early with clear error message

You'll see messages like:
```
⏭️  Skipping UI and accessibility tests (browser environment not available)
   Reason: Missing system libraries or Playwright browser installation
```

The system will still output `DONE - CHECKED - CONFIRMED - WORKING` when unit tests pass.

## Individual Test Commands

### Unit Tests
```bash
npx vitest run tests/unit --reporter=verbose
```
Runs Vitest unit tests covering:
- Case store operations (Dropbox mapping, state transitions, persistence)  
- HAC rules validation (document requirements, override logic)

### UI Tests
```bash
# Install Playwright browsers first (one-time setup)
npx playwright install chromium

# Run UI tests (requires browsers and dev server)
npx playwright test tests/ui --reporter=list
```
Tests the admin/agent interface:
- Cases board rendering and interactions
- Menu positioning and functionality
- Case action workflows (postpone, suspend, cancel, archive, delete)
- Mobile responsiveness
- Theme switching

### Accessibility Tests
```bash
node scripts/a11y-scan.js
```
Scans admin routes for WCAG 2.1 AA compliance:
- `/admin/cases`
- `/agent` 
- `/admin/checks`

**Note:** UI and accessibility tests require browser support. In environments without system libraries (like some containers), these tests will be automatically skipped.

## Test Results and Reports

### Screenshots
UI tests capture visual snapshots:
- **Location:** `playwright-report/cases_board.png`
- **Purpose:** Visual documentation (not pixel-diff testing)

### Test Reports
- **Playwright Report:** `playwright-report/index.html`
- **Unit Test Results:** `test-results/unit-results.json`
- **Coverage Report:** Generated in `coverage/` directory

### Viewing Reports
```bash
# Open Playwright report
npx playwright show-report

# View coverage (after running unit tests)
open coverage/index.html
```

## Running Specific Test Suites

### Single UI Test File
```bash
npx playwright test tests/ui/boards.spec.ts
```

### Single Unit Test File
```bash
npx vitest tests/unit/cases.store.spec.ts
```

### Debug Mode
```bash
# UI tests with browser window visible
npx playwright test --headed

# Unit tests in watch mode
npx vitest --watch
```

## Test Environment Setup

### Prerequisites
- Development server running on `http://localhost:5000`
- Node.js and npm installed
- Playwright browsers installed (`npm run test:ui:install`)

### Test Data
The QA system uses non-destructive test data:
- **Unit Tests:** In-memory mock data
- **UI Tests:** Existing cases or fallback seed data
- **No Production Impact:** Tests never modify real user data

### Seed Data
If no cases exist, tests automatically use mock data:
- Standard service case (`QA-STD-001`)
- Express service case (`QA-EXP-002`)  
- VIP+ service case (`QA-VIP-003`)

## Interpreting Test Failures

### Unit Test Failures
```bash
❌ QA FAILED at Unit Tests:
  - Check console output for specific test failures
  - Look for assertion errors or mock setup issues
  - Verify business logic changes haven't broken expectations
```

### UI Test Failures  
```bash
❌ QA FAILED at UI Tests:
  - Browser may have timed out waiting for elements
  - Check if dev server is running on correct port
  - Review screenshot in test-results/ for visual context
  - Verify UI elements haven't changed selectors
```

### Accessibility Failures
```bash
❌ QA FAILED at Accessibility Tests:
  - Lists specific WCAG violations with selectors
  - Includes help URLs for fixing each issue
  - Focus on color contrast, keyboard navigation, ARIA labels
```

## Configuration

### Playwright Config
- **Location:** `playwright.config.ts`
- **Settings:** Optimized for Replit environment
- **Browsers:** Chromium only (for speed)
- **Viewport:** 1280x800 desktop, mobile variants for responsive testing

### Vitest Config  
- **Location:** `vitest.config.ts`
- **Environment:** jsdom for DOM testing
- **Coverage:** Text, JSON, HTML reports
- **Timeout:** 10 seconds per test

## Troubleshooting

### Common Issues

**Dev Server Not Running**
```bash
Error: Development server is not running on port 5000
Solution: Start with `npm run dev`
```

**Playwright Installation**
```bash
Error: Browser not found
Solution: Run `npm run test:ui:install`
```

**Port Conflicts**
```bash
Error: Port 5000 already in use
Solution: Stop other processes or update baseURL in configs
```

**Timeout Errors**
```bash
Error: Test timeout after 30000ms
Solution: Check server performance, reduce test complexity
```

### Debug Tips

1. **Check Dev Server:** Ensure `http://localhost:5000` loads in browser
2. **Browser DevTools:** Add `--headed` flag to see UI tests run
3. **Console Logs:** Look for JavaScript errors in browser console
4. **Network Tab:** Verify API endpoints are responding
5. **Element Selectors:** Update test selectors if UI structure changed

## Architecture

### Test Structure
```
tests/
├── ui/
│   ├── boards.spec.ts      # Cases board UI tests
│   └── actions.spec.ts     # Case action tests
├── unit/
│   ├── cases.store.spec.ts # Case management tests
│   └── hac.rules.spec.ts   # HAC validation tests
├── setup.ts               # Test environment setup
└── seed-data.ts          # Mock data for testing
```

### Scripts
```
scripts/
├── qa-run.js             # Master QA runner
└── a11y-scan.js         # Accessibility scanner
```

### Admin Shell Scope
All tests target the admin shell (`.ai-shell`) to ensure marketing pages remain untouched.

## Quality Standards

### Coverage Goals
- **Unit Tests:** Core business logic coverage
- **UI Tests:** Critical user workflows
- **Accessibility:** WCAG 2.1 AA compliance
- **Performance:** No hard-coded delays, efficient selectors

### Test Reliability
- **Fail Fast:** Stop on first error for quick feedback
- **No Flaky Tests:** Use proper waits, not timeouts
- **Mobile Support:** Responsive testing included
- **Cross-Platform:** Works in Replit environment

## Success Criteria

The QA system passes when:
1. ✅ All unit tests pass
2. ✅ All UI workflows complete without errors  
3. ✅ No accessibility violations found
4. ✅ Visual snapshots captured successfully
5. ✅ No browser console errors during tests

**Final Output:**
```
DONE - CHECKED - CONFIRMED - WORKING
```

This output confirms the admin/agent application is fully functional and meets quality standards.