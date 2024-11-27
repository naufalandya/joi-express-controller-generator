const fs = require('fs');
const path = require('path');

// Generate controller for models dynamically
function generateDynamicController(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  const models = [];
  let currentModel = null;
  let fields = {};

  // Parse models and fields from schema
  lines.forEach((line) => {
    line = line.trim();

    if (line.startsWith('model ')) {
      currentModel = line.split(' ')[1];
      fields[currentModel] = [];
      models.push(currentModel);
    } else if (currentModel && line === '}') {
      currentModel = null;
    } else if (currentModel && line) {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const fieldName = parts[0];
        if (!fieldName.startsWith('//') && !fieldName.startsWith('@')) {
          fields[currentModel].push(fieldName);
        }
      }
    }
  });

  const controllers = models.map((model) => {
    const lowerCaseModel = model.replace(/_/g, '').toLowerCase(); // Generate a name in camelCase
    const validationSchemaName = `${lowerCaseModel}Schema`; // Assuming Joi schema files follow a naming convention

    // Dynamically generate destructured fields and field assignments
    const destructuredFields = fields[model].filter((field) => field !== 'id' && field !== 'project_id').join(', ');
    const dataFields = fields[model]
      .filter((field) => field !== 'id')
      .map((field) => {
        if (field === 'project_id') {
          return `        ${field}: Number(id)`;
        }
        return `        ${field}: ${field}`;
      })
      .join(',\n');

    return `
export const create${model} = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    if (!id || isNaN(Number(id))) {
      return next(new ErrorWithStatusCode("No project selected or invalid project ID!", 404));
    }

    const { error, value : validatedValue } = ${validationSchemaName}.validate(req.body);

    if (error) {
      return next(new ErrorWithStatusCode(error.message, 400));
    }

    const { ${destructuredFields} } = validatedValue;

    const result = await prisma.${lowerCaseModel}.create({
      data: {
${dataFields}
      }
    });

    res.status(201).json({
      success: true,
      message: '${model} created successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const get${model}s = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await prisma.${lowerCaseModel}.findMany();

    res.status(200).json({
      success: true,
      message: 'Retrieved all ${model} records.',
      data: results,
    });
  } catch (err) {
    next(err);
  }
};
`;
  });

  const output = `
import { ${models.map((model) => `${model.replace(/_/g, '').toLowerCase()}Schema`).join(', ')} } from '../validations'; // Adjust the Joi schema imports

${controllers.join('\n')}
`;

  fs.writeFileSync(
    path.join(__dirname, 'controllers.ts'),
    output,
    'utf-8'
  );

  console.log('Controller generated and saved to controllers.js');
}

// Path to your Prisma schema file
const prismaSchemaPath = path.join(__dirname, 'schema.txt');

// Generate the controller
generateDynamicController(prismaSchemaPath);
