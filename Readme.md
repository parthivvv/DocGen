# Document Generation Service

A backend service that generates PDF and DOCX documents from HTML content.

## Features

- Generate PDF documents from HTML content
- Generate DOCX documents from HTML content
- Support for headers and footers
- Watermark support
- Conditional footer rendering (only on the last page)
- Error handling and validation
- API documentation

## Tech Stack

- Node.js + Express for the REST API
- Puppeteer for PDF generation
- html-to-docx for DOCX generation
- Joi for input validation
- Winston for logging

## Requirements

- Node.js 14.x or higher
- NPM 6.x or higher

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/parthivvv/DocGen.git
   cd DocGen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

For development with automatic restart:
```bash
npm run dev
```

If you run into issues installing Puppeteer, install chromium through Puppeteer docs.
```bash
npx puppeteer install
```

## API Documentation

### Generate Document

Generates a PDF or DOCX document based on the provided HTML content.

**Endpoint:** `POST /api/generate`

**Request Body:**

```json
{
  "contentHtml": "<div>Main content goes here...</div>",
  "headerHtml": "<div>Header content</div>",
  "footerHtml": "<div>Footer content</div>",
  "documentType": "pdf", // or "docx"
  "watermark": "<div>DRAFT</div>", // Optional
  "footerOnLastPageOnly": true // Optional, defaults to false
}
```

**Response:**

The API responds with the generated file as a downloadable attachment.

## Testing

You can test the API using cURL:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "contentHtml": "<h1>Test Document</h1><p>This is a test document.</p>",
    "headerHtml": "<div style=\"text-align: center;\">Header</div>",
    "footerHtml": "<div style=\"text-align: center;\">Footer</div>",
    "documentType": "pdf"
  }' \
  --output test-document.pdf
```

### Core Features:
- ✅ PDF generation with content, header, and footer HTML
- ✅ DOCX generation with content, header, and footer HTML
- ✅ File download as attachment

### Bonus Tasks:
- ✅ Watermark support for both PDF
- ✅ Conditional footer rendering (only on the last page)

### Additional Features:
- ✅ Comprehensive error handling and validation
- ✅ Logging system with Winston
- ✅ Clean architecture with separation of concerns
- ✅ Detailed documentation
- ✅ Input validation with meaningful error messages

## Architecture

The application follows a modular architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement core business logic
- **Utils**: Provide utility functions for validation, error handling, and logging
