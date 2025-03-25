// routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const documentController = require('./controllers/documentController');

/**
 * @swagger
 * components:
 *   responses:
 *     DocumentGenerated:
 *       description: Document generated successfully
 *       content:
 *         application/pdf:
 *           schema:
 *             type: string
 *             format: binary
 *         application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *           schema:
 *             type: string
 *             format: binary
 *     BadRequest:
 *       description: Invalid input data
 *     InternalServerError:
 *       description: Internal server error
 * paths:
 *   /generate:
 *     post:
 *       summary: Generate a PDF or DOCX document from HTML content
 *       description: This endpoint generates a PDF or DOCX document based on the provided HTML content.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contentHtml:
 *                   type: string
 *                   description: The main HTML content of the document
 *                 headerHtml:
 *                   type: string
 *                   description: The HTML content of the header
 *                 footerHtml:
 *                   type: string
 *                   description: The HTML content of the footer
 *                 documentType:
 *                   type: string
 *                   enum: [pdf, docx]
 *                   description: The type of document to generate (PDF or DOCX)
 *                 watermark:
 *                   type: string
 *                   description: Optional watermark text
 *       responses:
 *         200:
 *           description: Document generated successfully
 *           content:
 *             application/pdf:
 *               schema:
 *                 type: string
 *                 format: binary
 *             application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *               schema:
 *                 type: string
 *                 format: binary
 *         400:
 *           $ref: '#/components/responses/BadRequest'
 *         500:
 *           $ref: '#/components/responses/InternalServerError'
 */

router.post('/generate', documentController.generateDocument);

module.exports = router;
