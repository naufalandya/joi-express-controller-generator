

const governanceRiskComplianceSchema = Joi.object({
  id: Joi.number().integer().min(0).max(1000000).messages({
        "string.base": "id must be a string",
        "number.base": "id must be a number",
        "date.base": "id must be a valid date"
      }),
  year: Joi.number().integer().min(0).max(1000000).allow(null).messages({
        "string.base": "year must be a string",
        "number.base": "year must be a number",
        "date.base": "year must be a valid date"
      }),
  instruction: Joi.string().min(1).max(255).allow(null).messages({
        "string.base": "instruction must be a string",
        "number.base": "instruction must be a number",
        "date.base": "instruction must be a valid date"
      }),
  follow_up: Joi.string().min(1).max(255).allow(null).messages({
        "string.base": "follow_up must be a string",
        "number.base": "follow_up must be a number",
        "date.base": "follow_up must be a valid date"
      }),
  value: Joi.number().integer().min(0).max(1000000).allow(null).messages({
        "string.base": "value must be a string",
        "number.base": "value must be a number",
        "date.base": "value must be a valid date"
      }),
  created_at: Joi.date().allow(null).messages({
        "string.base": "created_at must be a string",
        "number.base": "created_at must be a number",
        "date.base": "created_at must be a valid date"
      }),
  updated_at: Joi.date().allow(null).messages({
        "string.base": "updated_at must be a string",
        "number.base": "updated_at must be a number",
        "date.base": "updated_at must be a valid date"
      }),
  project_id: Joi.number().integer().min(0).max(1000000).allow(null).messages({
        "string.base": "project_id must be a string",
        "number.base": "project_id must be a number",
        "date.base": "project_id must be a valid date"
      }),
  project: Joi.any().allow(null).messages({
        "string.base": "project must be a string",
        "number.base": "project must be a number",
        "date.base": "project must be a valid date"
      }),
  type: Joi.string().valid('PEMENUHAN_TIMELINE_FINANCIAL_CLOSE', 'INITIAL_DRAWDOWN')
      .required()
      .messages({
        "any.only": "type must be one of the valid options.",
        "any.required": "type is required.",
        "string.base": "type must be a string."
      }),
});

module.exports = governanceRiskComplianceSchema;
