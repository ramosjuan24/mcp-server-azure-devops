import { WebApi } from 'azure-devops-node-api';
import { DeletePipelineOptions } from '../types';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

export async function deletePipeline(
  connection: WebApi,
  options: DeletePipelineOptions,
) {
  try {
    const pipelinesApi = await connection.getPipelinesApi();

    await pipelinesApi.deletePipeline(options.projectId, options.pipelineId);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Authentication failed')) {
        throw new AzureDevOpsAuthenticationError(
          'Failed to authenticate with Azure DevOps',
        );
      }
      if (error.message.includes('not found')) {
        throw new AzureDevOpsResourceNotFoundError(
          'Pipeline or project not found',
        );
      }
    }
    throw new AzureDevOpsError('Failed to delete pipeline');
  }
}
