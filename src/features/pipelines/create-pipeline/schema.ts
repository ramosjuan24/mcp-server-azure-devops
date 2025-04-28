import { z } from 'zod';

export const CreatePipelineSchema = z.object({
  projectId: z.string().optional(),
  name: z.string(),
  folder: z.string().optional(),
  configuration: z.object({
    type: z.enum(['yaml', 'designerJson']),
    path: z.string(),
    repository: z.object({
      id: z.string(),
      type: z.enum(['git', 'github', 'bitbucket']),
      name: z.string(),
      defaultBranch: z.string().optional(),
    }),
  }),
  variables: z
    .record(
      z.object({
        value: z.string(),
        isSecret: z.boolean().optional(),
      }),
    )
    .optional(),
});
