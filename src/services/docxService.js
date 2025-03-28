const htmlToDocx = require('html-to-docx');
const { JSDOM } = require('jsdom');
const logger = require('../utils/logger');
const { CustomError } = require('../utils/errorHandler');

class DOCXService {
    async generateDOCX({
        contentHtml,
        headerHtml,
        footerHtml,
        watermark,
        footerOnLastPageOnly = false
    }) {
        try {
            const cleanContent = this.cleanHtml(contentHtml);
            const cleanHeader = headerHtml ? this.cleanHtml(headerHtml) : '';
            const cleanFooter = footerHtml ? this.cleanHtml(footerHtml) : '';

            const fullHtmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        @page {
                            size: A4;
                            margin: 1in;
                            @bottom-center {
                                content: none;
                            }
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            position: relative;
                            min-height: 9.25in; /* A4 height - margins */
                        }
                        .page {
                            position: relative;
                            min-height: 9.25in;
                            padding: 1in;
                        }
                        .header {
                            position: absolute;
                            top: 0;
                            left: 1in;
                            right: 1in;
                        }
                        .content {
                            min-height: 7.25in; /* Adjusted for header/footer */
                            position: relative;
                        }
                        .footer {
                            position: absolute;
                            bottom: 0;
                            left: 1in;
                            right: 1in;
                            text-align: center;
                            ${footerOnLastPageOnly ? 'display: none;' : ''}
                        }
                        .last-page .footer {
                            display: block;
                        }
                        .watermark {
                            position: fixed;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%) rotate(-45deg);
                            opacity: 0.2;
                            z-index: -1;
                            color: gray;
                            font-size: 48px;
                        }
                    </style>
                </head>
                <body>
                    <div class="page ${footerOnLastPageOnly ? 'last-page' : ''}">
                        ${watermark ? `<div class="watermark">${watermark}</div>` : ''}
                        ${cleanHeader ? `<div class="header">${cleanHeader}</div>` : ''}
                        <div class="content">${cleanContent || ''}</div>
                        ${cleanFooter ? `<div class="footer">${cleanFooter}</div>` : ''}
                    </div>
                </body>
                </html>
            `;

            const options = {
                title: 'Generated Document',
                pageBreak: true,
                margins: {
                    top: 1440,
                    right: 1440,
                    bottom: 1440,
                    left: 1440
                },
                watermark: watermark ? {
                    text: this.cleanHtml(watermark),
                    color: 'gray',
                    opacity: 0.2,
                    rotation: -45,
                    fontSize: 48
                } : undefined
            };

            const buffer = await htmlToDocx(fullHtmlContent, options);
            return buffer;
        } catch (error) {
            logger.error('Error generating DOCX:', error);
            throw new CustomError(500, `Failed to generate DOCX: ${error.message}`);
        }
    }

    cleanHtml(html) {
        if (!html) return '';
        try {
            const dom = new JSDOM(html);
            const document = dom.window.document;
            document.querySelectorAll('img').forEach(img => {
                if (img.src && !img.src.startsWith('http') && !img.src.startsWith('data:')) {
                    img.src = '';
                }
            });
            document.querySelectorAll('script').forEach(script => script.remove());
            document.querySelectorAll('style').forEach(style => style.remove());
            return document.body.innerHTML;
        } catch (error) {
            logger.warn('Error cleaning HTML:', error);
            return html;
        }
    }
}

module.exports = new DOCXService();