import { z } from 'zod';
import { defaultProject } from '../../../utils/environment';

export const CreatePipelineSchema = z.object({
  projectId: z
    .string()
    .optional()
    .describe(`The ID or name of the project (Default: ${defaultProject})`),
  name: z.string().describe('Name of the pipeline'),
  folder: z.string().optional().describe('Folder of the pipeline'),
  configuration: z.object({
    type: z.enum([
      'yaml',
      'designerJson',
      'designerHyphenJson',
      'justInTime',
      'unknown',
    ]),
    path: z
      .string()
      .optional()
      .describe('Path to the pipeline configuration file'),
    repository: z.object({
      id: z.string().describe('ID of the repository'),
      type: z
        .enum(['git', 'github', 'bitbucket', 'azureReposGit'])
        .describe('Type of repository'),
      name: z.string().describe('Name of the repository'),
      defaultBranch: z
        .string()
        .optional()
        .describe('Default branch of the repository'),
    }),
  }),
  variables: z
    .record(
      z.object({
        value: z.string(),
        isSecret: z.boolean().optional(),
      }),
    )
    .optional()
    .describe('Variables to be used in the pipeline'),
});
