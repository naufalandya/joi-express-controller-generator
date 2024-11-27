
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prismaClient'; // Adjust the import path for your Prisma client
import ErrorWithStatusCode from '../utils/ErrorWithStatusCode'; // Adjust the error utility path
import { governanceriskcomplianceSchema } from '../validations'; // Adjust the Joi schema imports


export const creategovernance_risk_compliance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    if (!id || isNaN(Number(id))) {
      return next(new ErrorWithStatusCode("No project selected or invalid project ID!", 404));
    }

    const { error, value : validatedValue } = governanceriskcomplianceSchema.validate(req.body);

    if (error) {
      return next(new ErrorWithStatusCode(error.message, 400));
    }

    const { year, instruction, follow_up, value, created_at, updated_at, project, type } = validatedValue;

    const result = await prisma.governanceriskcompliance.create({
      data: {
        year: year,
        instruction: instruction,
        follow_up: follow_up,
        value: value,
        created_at: created_at,
        updated_at: updated_at,
        project_id: Number(id),
        project: project,
        type: type
      }
    });

    res.status(201).json({
      success: true,
      message: 'governance_risk_compliance created successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getgovernance_risk_compliances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await prisma.governanceriskcompliance.findMany();

    res.status(200).json({
      success: true,
      message: 'Retrieved all governance_risk_compliance records.',
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

