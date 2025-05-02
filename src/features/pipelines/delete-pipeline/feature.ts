import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

export interface DeletePipelineOptions {
  projectId: string;
  pipelineId: number;
}

export async function deletePipeline(
  connection: WebApi,
  options: DeletePipelineOptions,
): Promise<void> {
  try {
    const pipelinesApi = await connection.getPipelinesApi();

    await pipelinesApi.deletePipeline(options.projectId, options.pipelineId);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('Authentication') ||
        error.message.includes('Unauthorized') ||
        error.message.includes('401')
      ) {
        throw new AzureDevOpsAuthenticationError(
          'Failed to authenticate with Azure DevOps',
        );
      }
      if (
        error.message.includes('not found') ||
        error.message.includes('does not exist') ||
        error.message.includes('404')
      ) {
        throw new AzureDevOpsResourceNotFoundError(
          `Pipeline with ID ${options.pipelineId} not found`,
        );
      }
    }
    throw new AzureDevOpsError('Failed to delete pipeline');
  }
}
