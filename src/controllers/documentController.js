const pdfService = require('../services/pdfService');
const docxService = require('../services/docxService');
const { validateGenerateInput } = require('../utils/validation');
const logger = require('../utils/logger');
const { CustomError } = require('../utils/errorHandler');

/**
 * Generate document controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.generateDocument = async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = validateGenerateInput(req.body);
        if (error) {
            throw new CustomError(400, error.message);
        }

        // Extract validated data
        const { contentHtml, headerHtml, footerHtml, documentType, watermark } = value;

        let buffer, filename, contentType;

        // Generate document based on type
        if (documentType === 'pdf') {
            logger.info('Generating PDF document');
            buffer = await pdfService.generatePDF({
                contentHtml,
                headerHtml,
                footerHtml,
                watermark,
                footerOnLastPageOnly: !!value.footerOnLastPageOnly
            });
            filename = 'document.pdf';
            contentType = 'application/pdf';
        } else if (documentType === 'docx') {
            logger.info('Generating DOCX document');
            buffer = await docxService.generateDOCX({
                contentHtml,
                headerHtml,
                footerHtml,
                watermark,
                footerOnLastPageOnly: !!value.footerOnLastPageOnly
            });
            filename = 'document.docx';
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else {
            throw new CustomError(400, 'Invalid document type');
        }

        if (!buffer) {
            throw new CustomError(500, 'Failed to generate document');
        }

        // Set headers for file download
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Length', buffer.length);

        // Send the file
        return res.send(buffer);
    } catch (error) {
        logger.error('Document generation error:', error);
        next(error);
    }
};