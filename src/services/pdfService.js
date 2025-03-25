const puppeteer = require('puppeteer');
const logger = require('../utils/logger');
const { CustomError } = require('../utils/errorHandler');

/**
 * Service for generating PDF documents from HTML content
 */
class PDFService {
    /**
     * Generate PDF from HTML content
     * @param {Object} options - Options for PDF generation
     * @param {string} options.contentHtml - Main content HTML
     * @param {string} options.headerHtml - Header HTML
     * @param {string} options.footerHtml - Footer HTML
     * @param {string} options.watermark - Optional watermark HTML
     * @param {boolean} options.footerOnLastPageOnly - Whether to show footer only on last page
     * @returns {Promise<Buffer>} - PDF buffer
     */
    async generatePDF({
                          contentHtml,
                          headerHtml,
                          footerHtml,
                          watermark,
                          footerOnLastPageOnly = false
                      }) {
        let browser;

        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();

            // Prepare the HTML with styles for header, footer, and watermark
            const htmlContent = this.prepareHTML({
                contentHtml,
                headerHtml,
                footerHtml,
                watermark,
                footerOnLastPageOnly
            });

            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '100px',
                    bottom: '100px',
                    left: '50px',
                    right: '50px'
                },
                displayHeaderFooter: true,
                headerTemplate: headerHtml ? `
          <div style="width: 100%; font-size: 10px; padding: 10px 50px; box-sizing: border-box;">
            ${headerHtml}
          </div>
        ` : '<div></div>',
                footerTemplate: footerHtml ? `
          <div style="width: 100%; font-size: 10px; padding: 10px 50px; box-sizing: border-box;">
            ${footerOnLastPageOnly ? `
              <span class="pageNumber"></span>
              <span class="totalPages"></span>
              <script>
                if (parseInt(document.querySelector('.pageNumber').innerText) === parseInt(document.querySelector('.totalPages').innerText)) {
                  document.write('${footerHtml.replace(/'/g, "\\'")}');
                }
              </script>
            ` : footerHtml}
          </div>
        ` : '<div></div>',
            });

            return pdfBuffer;
        } catch (error) {
            logger.error('Error generating PDF:', error);
            throw new CustomError(500, `Failed to generate PDF: ${error.message}`);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    /**
     * Prepare HTML content with styling
     * @param {Object} options - HTML content options
     * @returns {string} - Prepared HTML
     */
    prepareHTML({ contentHtml, watermark, footerOnLastPageOnly }) {
        let watermarkStyle = '';
        let watermarkDiv = '';

        if (watermark) {
            watermarkStyle = `
        .watermark {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1000;
          opacity: 0.2;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
      `;

            watermarkDiv = `
        <div class="watermark">
          ${watermark}
        </div>
      `;
        }

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Generated Document</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
          }
          .content {
            margin: 0 auto;
            padding: 20px 0;
          }
          ${watermarkStyle}
          @media print {
            .page-break {
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        ${watermarkDiv}
        <div class="content">
          ${contentHtml}
        </div>
        <script>
          // Script for handling footer on last page only if needed
          ${footerOnLastPageOnly ? `
            document.addEventListener('DOMContentLoaded', function() {
              // Add custom logic if needed for client-side rendering
            });
          ` : ''}
        </script>
      </body>
      </html>
    `;
    }
}

module.exports = new PDFService();