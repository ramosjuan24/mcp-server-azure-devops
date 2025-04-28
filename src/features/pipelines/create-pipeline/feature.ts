import { WebApi } from 'azure-devops-node-api';
import { ConfigurationType } from 'azure-devops-node-api/interfaces/PipelinesInterfaces';
import { CreatePipelineOptions } from '../types';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

export async function createPipeline(
  connection: WebApi,
  options: CreatePipelineOptions,
) {
  try {
    const pipelinesApi = await connection.getPipelinesApi();

    const pipelineConfiguration = {
      name: options.name,
      folder: options.folder,
      configuration: {
        type: options.configuration.type as unknown as ConfigurationType,
        path: options.configuration.path,
        repository: {
          id: options.configuration.repository.id,
          type: options.configuration.repository.type,
          name: options.configuration.repository.name,
          defaultBranch: options.configuration.repository.defaultBranch,
        },
      },
    };

    console.log(
      'Pipeline Configuration:',
      JSON.stringify(pipelineConfiguration, null, 2),
    );

    const result = await pipelinesApi.createPipeline(
      pipelineConfiguration,
      options.projectId,
    );

    return result;
  } catch (error) {
    console.error('Error creating pipeline:', error);

    if (error instanceof Error) {
      if (error.message.includes('Authentication failed')) {
        throw new AzureDevOpsAuthenticationError(
          'Failed to authenticate with Azure DevOps',
        );
      }
      if (error.message.includes('not found')) {
        throw new AzureDevOpsResourceNotFoundError(
          'Project or repository not found',
        );
      }
      // Agregar más detalles del error
      throw new AzureDevOpsError(`Failed to create pipeline: ${error.message}`);
    }
    throw new AzureDevOpsError('Failed to create pipeline: Unknown error');
  }
}
