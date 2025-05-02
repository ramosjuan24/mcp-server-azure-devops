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

    // Create pipeline using the API
    const result = await pipelinesApi.createPipeline(
      pipelineConfiguration,
      options.projectId,
    );

    return result;
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
          `Project or repository not found: ${errorMessage}\n${detailedMessage}`,
        );
      }

      if (errorMessage.includes('Validation')) {
        throw new AzureDevOpsError(
          `Validation error while creating pipeline: ${errorMessage}\n${detailedMessage}`,
        );
      }

      throw new AzureDevOpsError(
        `Failed to create pipeline: ${errorMessage}\n${detailedMessage}`,
      );
    }
    throw new AzureDevOpsError(
      'Failed to create pipeline: Unknown error occurred',
    );
  }
}
