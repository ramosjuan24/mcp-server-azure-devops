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
    const client = connection.rest;
    await client.del(
      `${connection.serverUrl}/${options.projectId}/_apis/pipelines/${options.pipelineId}?api-version=7.1`,
    );
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message;
      const errorDetails = {
        message: errorMessage,
        stack: error.stack,
        name: error.name,
        ...(error as any).response?.data,
        ...(error as any).response?.status,
        ...(error as any).response?.statusText,
      };

      const detailedMessage = `Error details: ${JSON.stringify(errorDetails, null, 2)}`;

      if (
        errorMessage.includes('Authentication') ||
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('401')
      ) {
        throw new AzureDevOpsAuthenticationError(
          `Failed to authenticate with Azure DevOps: ${errorMessage}\n${detailedMessage}`,
        );
      }
      if (
        errorMessage.includes('not found') ||
        errorMessage.includes('does not exist') ||
        errorMessage.includes('404')
      ) {
        throw new AzureDevOpsResourceNotFoundError(
          `Pipeline with ID ${options.pipelineId} not found: ${errorMessage}\n${detailedMessage}`,
        );
      }
      throw new AzureDevOpsError(
        `Failed to delete pipeline: ${errorMessage}\n${detailedMessage}`,
      );
    }
    throw new AzureDevOpsError(
      'Failed to delete pipeline: Unknown error occurred',
    );
  }
}
