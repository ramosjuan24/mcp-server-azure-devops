import { WebApi } from 'azure-devops-node-api';
import { DeleteEnvironmentOptions } from '../types';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

export async function deleteEnvironment(
  connection: WebApi,
  options: DeleteEnvironmentOptions,
) {
  try {
    const releaseApi = await connection.getReleaseApi();

    await releaseApi.deleteEnvironment(
      options.projectId,
      options.environmentId,
    );

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
          'Environment or project not found',
        );
      }
    }
    throw new AzureDevOpsError('Failed to delete environment');
  }
}
