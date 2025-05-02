import { WebApi } from 'azure-devops-node-api';
import { CreateEnvironmentOptions } from '../types';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

export async function createEnvironment(
  connection: WebApi,
  options: CreateEnvironmentOptions,
) {
  try {
    const releaseApi = await connection.getReleaseApi();

    const environment = {
      name: options.name,
      description: options.description,
    };

    const result = await releaseApi.createEnvironment(
      environment,
      options.projectId,
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
        throw new AzureDevOpsResourceNotFoundError('Project not found');
      }
    }
    throw new AzureDevOpsError('Failed to create environment');
  }
}
