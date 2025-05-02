import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

export const RunPipelineSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  pipelineId: z
    .number()
    .int()
    .positive()
    .describe('The ID of the pipeline to run'),
  previewRun: z
    .boolean()
    .optional()
    .describe('If true, only preview the YAML without running the pipeline'),
  stagesToSkip: z
    .array(z.string())
    .optional()
    .describe('List of stages to skip in the pipeline run'),
  templateParameters: z
    .record(z.any())
    .optional()
    .describe('Template parameters for the pipeline run'),
  variables: z
    .record(
      z.object({
        value: z.string(),
        isSecret: z.boolean().optional(),
      }),
    )
    .optional()
    .describe('Variables to use in the pipeline run'),
  yamlOverride: z
    .string()
    .optional()
    .describe('Alternative YAML to use for preview runs'),
});
