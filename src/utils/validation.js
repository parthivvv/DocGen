const Joi = require('joi');

/**
 * Validate input for document generation
 * @param {Object} data - Request body data
 * @returns {Object} - Validation result
 */
const validateGenerateInput = (data) => {
    const schema = Joi.object({
        contentHtml: Joi.string().required().max(10000000).messages({
            'string.base': 'Content HTML must be a string',
            'string.empty': 'Content HTML is required',
            'string.max': 'Content HTML exceeds maximum size',
            'any.required': 'Content HTML is required'
        }),
        headerHtml: Joi.string().allow('').optional().max(100000).messages({
            'string.base': 'Header HTML must be a string',
            'string.max': 'Header HTML exceeds maximum size'
        }),
        footerHtml: Joi.string().allow('').optional().max(100000).messages({
            'string.base': 'Footer HTML must be a string',
            'string.max': 'Footer HTML exceeds maximum size'
        }),
        documentType: Joi.string().required().valid('pdf', 'docx').messages({
            'string.base': 'Document type must be a string',
            'string.empty': 'Document type is required',
            'any.only': 'Document type must be either "pdf" or "docx"',
            'any.required': 'Document type is required'
        }),
        watermark: Joi.string().allow('').optional().max(100000).messages({
            'string.base': 'Watermark must be a string',
            'string.max': 'Watermark exceeds maximum size'
        }),
        footerOnLastPageOnly: Joi.boolean().optional().default(false).messages({
            'boolean.base': 'Footer on last page flag must be a boolean'
        })
    });

    return schema.validate(data);
};

module.exports = {
    validateGenerateInput
};