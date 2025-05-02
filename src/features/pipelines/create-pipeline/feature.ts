import { WebApi } from 'azure-devops-node-api';
import { ConfigurationType } from 'azure-devops-node-api/interfaces/PipelinesInterfaces';
import { CreatePipelineOptions } from '../types';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

interface PipelineConfiguration {
  name: string;
  folder?: string;
  configuration: {
    type: ConfigurationType;
    path?: string;
    repository: {
      id: string;
      type: string;
      name: string;
      defaultBranch?: string;
    };
  };
  variables?: Record<string, { value: string; isSecret?: boolean }>;
}

export async function createPipeline(
  connection: WebApi,
  options: CreatePipelineOptions,
) {
  try {
    const pipelinesApi = await connection.getPipelinesApi();

    // Prepare pipeline configuration according to API documentation
    const pipelineConfiguration: PipelineConfiguration = {
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

    // Add variables if provided
    if (options.variables) {
      pipelineConfiguration.variables = options.variables;
    }

    const result = await pipelinesApi.createPipeline(
      pipelineConfiguration,
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
        throw new AzureDevOpsResourceNotFoundError(
          'Project or repository not found',
        );
      }
    }
    throw new AzureDevOpsError('Failed to create pipeline');
  }
}
