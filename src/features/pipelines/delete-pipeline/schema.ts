import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

export const DeletePipelineSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  pipelineId: z
    .number()
    .int()
    .positive()
    .describe('The ID of the pipeline to delete'),
});
