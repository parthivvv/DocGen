const htmlToDocx = require('html-to-docx');
const { JSDOM } = require('jsdom');
const logger = require('../utils/logger');
const { CustomError } = require('../utils/errorHandler');

/**
 * Service for generating DOCX documents from HTML content
 */
class DOCXService {
    /**
     * Generate DOCX from HTML content
     * @param {Object} options - Options for DOCX generation
     * @param {string} options.contentHtml - Main content HTML
     * @param {string} options.headerHtml - Header HTML
     * @param {string} options.footerHtml - Footer HTML
     * @param {string} options.watermark - Optional watermark HTML
     * @param {boolean} options.footerOnLastPageOnly - Whether to show footer only on last page
     * @returns {Promise<Buffer>} - DOCX buffer
     */
    async generateDOCX({
                           contentHtml,
                           headerHtml,
                           footerHtml,
                           watermark,
                           footerOnLastPageOnly = false
                       }) {
        try {
            // Clean and prepare the HTML content
            const cleanContent = this.cleanHtml(contentHtml);
            const cleanHeader = headerHtml ? this.cleanHtml(headerHtml) : '';
            const cleanFooter = footerHtml ? this.cleanHtml(footerHtml) : '';

            // Prepare watermark if exists
            let watermarkText = '';
            if (watermark) {
                const dom = new JSDOM(watermark);
                watermarkText = dom.window.document.body.textContent.trim();
            }

            // Configure document options
            const options = {
                title: 'Generated Document',
                header: cleanHeader ? {
                    default: cleanHeader
                } : undefined,
                footer: cleanFooter ? {
                    default: footerOnLastPageOnly ? undefined : cleanFooter,
                    first: undefined,
                    even: footerOnLastPageOnly ? undefined : cleanFooter,
                } : undefined,
                pageNumber: true,
                watermark: watermarkText || undefined,
                orientation: 'portrait',
                margins: {
                    top: 1440, // 1 inch in twips
                    right: 1440,
                    bottom: 1440,
                    left: 1440
                }
            };

            // If footer should only be on last page, we need special handling
            if (footerOnLastPageOnly && cleanFooter) {
                options.footer = {
                    default: undefined,
                    first: undefined,
                    even: undefined
                };

                // We need to add a section break before the last paragraph and apply the footer only to that section
                // This requires manipulating the document.xml after generation
                // For simplicity, we'll add a placeholder and handle it during document generation
                cleanContent += `
          <div style="page-break-before: always;"></div>
          <div class="last-page" style="display: none;">
            <!-- Last page marker for footer -->
          </div>
          <p>${cleanFooter}</p>
        `;
            }

            // Generate the DOCX document
            const buffer = await htmlToDocx(cleanContent, options);
            return buffer;
        } catch (error) {
            logger.error('Error generating DOCX:', error);
            throw new CustomError(500, `Failed to generate DOCX: ${error.message}`);
        }
    }

    /**
     * Clean HTML content for better DOCX compatibility
     * @param {string} html - HTML content to clean
     * @returns {string} - Cleaned HTML
     */
    cleanHtml(html) {
        if (!html) return '';

        try {
            const dom = new JSDOM(html);
            const document = dom.window.document;

            // Fix relative paths in images
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                if (img.src && !img.src.startsWith('http') && !img.src.startsWith('data:')) {
                    img.src = ''; // Remove invalid image sources
                }
            });

            // Remove script tags as they're not needed in DOCX
            const scripts = document.querySelectorAll('script');
            scripts.forEach(script => script.remove());

            // Remove style tags (we'll handle styling differently in DOCX)
            const styles = document.querySelectorAll('style');
            styles.forEach(style => style.remove());

            return document.body.innerHTML;
        } catch (error) {
            logger.warn('Error cleaning HTML:', error);
            // Return the original HTML if cleaning fails
            return html;
        }
    }
}

module.exports = new DOCXService();