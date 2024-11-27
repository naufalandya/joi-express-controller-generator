const fs = require('fs');
const path = require('path');

function mapPrismaToJoi(fieldType, isNullable, min, max, enumValues = null) {
  let joiType;

  if (enumValues) {
    joiType = `Joi.string().valid(${enumValues.map((v) => `'${v}'`).join(', ')})`;
  } else {
    switch (fieldType) {
      case 'Int':
        joiType = `Joi.number().integer().min(${min || 0}).max(${max || 1000000})`;
        break;
      case 'String':
        joiType = `Joi.string().min(${min || 1}).max(${max || 255})`;
        break;
      case 'DateTime':
        joiType = 'Joi.date()';
        break;
      case 'Boolean':
        joiType = 'Joi.boolean()';
        break;
      default:
        joiType = 'Joi.any()'; 
    }
  }

  if (isNullable) {
    joiType += '.allow(null)';
  }

  return joiType;
}

function generateJoiSchema(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  const joiFields = [];
  const enums = {}; 

  let currentEnum = null;

  lines.forEach((line) => {
    line = line.trim();

    if (line.startsWith('enum ')) {
      currentEnum = line.split(' ')[1];
      enums[currentEnum] = [];
    } else if (currentEnum && line === '}') {
      currentEnum = null;
    } else if (currentEnum) {
      enums[currentEnum].push(line.replace(',', '').trim());
    }
  });

  lines.forEach((line) => {
    line = line.trim();

    if (!line || line.startsWith('model') || line.startsWith('//') || line.startsWith('}') || line.startsWith('enum')) {
      return;
    }

    const parts = line.split(/\s+/);
    if (parts.length < 2) return;

    const fieldName = parts[0];
    let fieldType = parts[1];
    const isNullable = fieldType && fieldType.includes('?');
    fieldType = fieldType ? fieldType.replace('?', '') : null;

    if (!fieldType) return; 

    let enumValues = null;
    if (enums[fieldType]) {
      enumValues = enums[fieldType];
    }

    let min = 0;
    let max = 255;

    if (fieldType === 'Int') {
      min = 0;
      max = 1000000;
    } else if (fieldType === 'String') {
      min = 1;
      max = 255;
    }

    const joiType = mapPrismaToJoi(fieldType, isNullable, min, max, enumValues);

    const fieldMessages = enumValues
      ? `
      .required()
      .messages({
        "any.only": "${fieldName} must be one of the valid options.",
        "any.required": "${fieldName} is required.",
        "string.base": "${fieldName} must be a string."
      })`
      : `.messages({
        "string.base": "${fieldName} must be a string",
        "number.base": "${fieldName} must be a number",
        "date.base": "${fieldName} must be a valid date"
      })`;

    joiFields.push(`  ${fieldName}: ${joiType}${fieldMessages},`);
  });

  const joiSchema = `

const governanceRiskComplianceSchema = Joi.object({
${joiFields.join('\n')}
});

module.exports = governanceRiskComplianceSchema;
`;

  fs.writeFileSync(
    path.join(__dirname, 'validation.js'),
    joiSchema,
    'utf-8'
  );

  console.log('Joi schema generated and saved to validation.js');
}

const prismaSchemaPath = path.join(__dirname, 'schema.txt');

generateJoiSchema(prismaSchemaPath);
