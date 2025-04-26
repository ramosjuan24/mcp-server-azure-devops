import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

/**
 * Schema for the getPipeline function
 */
export const GetPipelineSchema = z.object({
  // The project containing the pipeline
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  // The ID of the pipeline to retrieve
  pipelineId: z
    .number()
    .int()
    .positive()
    .describe('The numeric ID of the pipeline to retrieve'),
  // The version of the pipeline to retrieve
  pipelineVersion: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      'The version of the pipeline to retrieve (latest if not specified)',
    ),
});
