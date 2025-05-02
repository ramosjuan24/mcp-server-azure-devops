import { WebApi } from 'azure-devops-node-api';
import { UpdateEnvironmentOptions } from '../types';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

export async function updateEnvironment(
  connection: WebApi,
  options: UpdateEnvironmentOptions,
) {
  try {
    const releaseApi = await connection.getReleaseApi();

    const environment = {
      name: options.name,
      description: options.description,
    };

    const result = await releaseApi.updateEnvironment(
      environment,
      options.projectId,
      options.environmentId,
    );

    return result;
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
    throw new AzureDevOpsError('Failed to update environment');
  }
}
