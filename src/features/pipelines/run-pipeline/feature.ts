import { WebApi } from 'azure-devops-node-api';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

/**
 * Opciones para ejecutar un pipeline
 */
export interface RunPipelineOptions {
  /** ID o nombre del proyecto */
  projectId: string;
  /** ID del pipeline a ejecutar */
  pipelineId: number;
  /** Si es true, solo previsualiza el YAML sin ejecutar el pipeline */
  previewRun?: boolean;
  /** Lista de etapas a saltar en la ejecución */
  stagesToSkip?: string[];
  /** Parámetros para las plantillas del pipeline */
  templateParameters?: Record<string, any>;
  /** Variables para usar en el pipeline */
  variables?: Record<string, { value: string; isSecret?: boolean }>;
  /** YAML alternativo para usar en ejecuciones de previsualización */
  yamlOverride?: string;
}

/**
 * Ejecuta un pipeline en Azure DevOps
 *
 * @param connection - Cliente de Azure DevOps
 * @param options - Opciones para ejecutar el pipeline
 * @returns La respuesta de la API con los detalles de la ejecución
 * @throws {AzureDevOpsAuthenticationError} Si falla la autenticación
 * @throws {AzureDevOpsResourceNotFoundError} Si no se encuentra el pipeline
 * @throws {AzureDevOpsError} Si ocurre cualquier otro error
 *
 * @example
 * ```typescript
 * const result = await runPipeline(connection, {
 *   projectId: 'angular-project',
 *   pipelineId: 13,
 *   variables: {
 *     environment: { value: 'production' }
 *   }
 * });
 * ```
 */
export async function runPipeline(
  connection: WebApi,
  options: RunPipelineOptions,
): Promise<any> {
  try {
    const client = connection.rest;
    const response = await client.create(
      `${connection.serverUrl}/${options.projectId}/_apis/pipelines/${options.pipelineId}/runs?api-version=7.1`,
      {
        previewRun: options.previewRun,
        stagesToSkip: options.stagesToSkip,
        templateParameters: options.templateParameters,
        variables: options.variables,
        yamlOverride: options.yamlOverride,
      },
    );

    return response;
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
        `Failed to run pipeline: ${errorMessage}\n${detailedMessage}`,
      );
    }
    throw new AzureDevOpsError(
      'Failed to run pipeline: Unknown error occurred',
    );
  }
}
