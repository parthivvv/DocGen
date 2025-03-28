const puppeteer = require('puppeteer');
const logger = require('../utils/logger');
const { CustomError } = require('../utils/errorHandler');

class PDFService {
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
            const htmlContent = this.prepareHTML({
                contentHtml,
                headerHtml,
                footerHtml,
                watermark,
                footerOnLastPageOnly
            });

            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '100px',
                    bottom: '100px',
                    left: '50px',
                    right: '50px'
                },
                displayHeaderFooter: false
            });

            return pdfBuffer;
        } catch (error) {
            logger.error('Error generating PDF:', error);
            throw new CustomError(500, `Failed to generate PDF: ${error.message}`);
        } finally {
            if (browser) await browser.close();
        }
    }

    prepareHTML({ 
        contentHtml, 
        headerHtml, 
        footerHtml, 
        watermark, 
        footerOnLastPageOnly 
    }) {
        const watermarkStyle = watermark ? `
            .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                opacity: 0.2;
                z-index: -1;
                color: gray;
                font-size: 48px;
                pointer-events: none;
            }
        ` : '';

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Generated Document</title>
                <style>
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .page {
                        position: relative;
                        min-height: 1056px; /* A4 height at 96dpi - margins */
                        padding: 100px 50px;
                        box-sizing: border-box;
                    }
                    .header {
                        position: absolute;
                        top: 0;
                        left: 50px;
                        right: 50px;
                        padding-top: 50px;
                    }
                    .content {
                        min-height: 756px; /* Adjusted for header/footer space */
                        position: relative;
                    }
                    .footer {
                        position: absolute;
                        bottom: 0;
                        left: 50px;
                        right: 50px;
                        padding-bottom: 50px;
                        ${footerOnLastPageOnly ? 'display: none;' : ''}
                    }
                    .last-page .footer {
                        display: block;
                    }
                    ${watermarkStyle}
                </style>
            </head>
            <body>
                ${watermark ? `<div class="watermark">${watermark}</div>` : ''}
                <div class="page ${footerOnLastPageOnly ? 'last-page' : ''}">
                    ${headerHtml ? `<div class="header">${headerHtml}</div>` : ''}
                    <div class="content">${contentHtml || ''}</div>
                    ${footerHtml ? `<div class="footer">${footerHtml}</div>` : ''}
                </div>
                <script>
                    // For multi-page documents
                    if (${footerOnLastPageOnly} && document.body.scrollHeight > 1056) {
                        document.querySelector('.page').classList.remove('last-page');
                        const pages = Math.ceil(document.body.scrollHeight / 1056);
                        for (let i = 1; i < pages; i++) {
                            const clone = document.querySelector('.page').cloneNode(true);
                            clone.classList.remove('last-page');
                            document.body.appendChild(clone);
                        }
                        const lastPage = document.createElement('div');
                        lastPage.classList.add('page', 'last-page');
                        lastPage.innerHTML = document.querySelector('.content').innerHTML + 
                            '${footerHtml ? `<div class="footer">${footerHtml}</div>` : ''}';
                        document.body.appendChild(lastPage);
                    }
                </script>
            </body>
            </html>
        `;
    }
}

module.exports = new PDFService();