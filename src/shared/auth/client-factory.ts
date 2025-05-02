import { WebApi, getPersonalAccessTokenHandler } from 'azure-devops-node-api';
import { ICoreApi } from 'azure-devops-node-api/CoreApi';
import { IGitApi } from 'azure-devops-node-api/GitApi';
import { IWorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { IBuildApi } from 'azure-devops-node-api/BuildApi';
import { ITestApi } from 'azure-devops-node-api/TestApi';
import { IReleaseApi } from 'azure-devops-node-api/ReleaseApi';
import { ITaskAgentApi } from 'azure-devops-node-api/TaskAgentApi';
import { ITaskApi } from 'azure-devops-node-api/TaskApi';
import { BearerCredentialHandler } from 'azure-devops-node-api/handlers/bearertoken';
import { DefaultAzureCredential, AzureCliCredential } from '@azure/identity';
import { AzureDevOpsError, AzureDevOpsAuthenticationError } from '../errors';
import { AuthConfig, AuthenticationMethod } from './auth-factory';

/**
 * Azure DevOps Client
 *
 * Provides access to Azure DevOps APIs using the configured authentication method
 */
export class AzureDevOpsClient {
  private config: AuthConfig;
  private clientPromise: Promise<WebApi> | null = null;

  /**
   * Creates a new Azure DevOps client
   *
   * @param config Authentication configuration
   */
  constructor(config: AuthConfig) {
    this.config = config;
  }

  /**
   * Get the authenticated Azure DevOps client
   *
   * @returns The authenticated WebApi client
   * @throws {AzureDevOpsAuthenticationError} If authentication fails
   */
  private async getClient(): Promise<WebApi> {
    if (!this.clientPromise) {
      this.clientPromise = (async () => {
        try {
          let client: WebApi;

          switch (this.config.method) {
            case AuthenticationMethod.PersonalAccessToken:
              client = await this.createPatClient();
              break;
            case AuthenticationMethod.AzureIdentity:
              client = await this.createAzureIdentityClient();
              break;
            case AuthenticationMethod.AzureCli:
              client = await this.createAzureCliClient();
              break;
            default:
              throw new AzureDevOpsAuthenticationError(
                `Unsupported authentication method: ${this.config.method}`,
              );
          }

          // Configurar la versión de la API
          client.serverUrl = `${this.config.organizationUrl}?api-version=7.1`;

          // Test the connection
          const locationsApi = await client.getLocationsApi();
          await locationsApi.getResourceAreas();

          return client;
        } catch (error) {
          if (error instanceof AzureDevOpsError) {
            throw error;
          }
          throw new AzureDevOpsAuthenticationError(
            error instanceof Error
              ? `Authentication failed: ${error.message}`
              : 'Authentication failed: Unknown error',
          );
        }
      })();
    }
    return this.clientPromise;
  }

  private async createPatClient(): Promise<WebApi> {
    if (!this.config.personalAccessToken) {
      throw new AzureDevOpsAuthenticationError(
        'Personal Access Token is required',
      );
    }
    const authHandler = getPersonalAccessTokenHandler(
      this.config.personalAccessToken,
    );
    return new WebApi(this.config.organizationUrl, authHandler);
  }

  private async createAzureIdentityClient(): Promise<WebApi> {
    const credential = new DefaultAzureCredential();
    const token = await credential.getToken(
      '499b84ac-1321-427f-aa17-267ca6975798/.default',
    );
    const authHandler = new BearerCredentialHandler(token.token);
    return new WebApi(this.config.organizationUrl, authHandler);
  }

  private async createAzureCliClient(): Promise<WebApi> {
    const credential = new AzureCliCredential();
    const token = await credential.getToken(
      '499b84ac-1321-427f-aa17-267ca6975798/.default',
    );
    const authHandler = new BearerCredentialHandler(token.token);
    return new WebApi(this.config.organizationUrl, authHandler);
  }

  /**
   * Get the underlying WebApi client
   *
   * @returns The authenticated WebApi client
   * @throws {AzureDevOpsAuthenticationError} If authentication fails
   */
  public async getWebApiClient(): Promise<WebApi> {
    return this.getClient();
  }

  /**
   * Check if the client is authenticated
   *
   * @returns True if the client is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    try {
      const client = await this.getClient();
      return !!client;
    } catch {
      // Any error means we're not authenticated
      return false;
    }
  }

  /**
   * Get the Core API
   *
   * @returns The Core API client
   * @throws {AzureDevOpsAuthenticationError} If authentication fails
   */
  public async getCoreApi(): Promise<ICoreApi> {
    try {
      const client = await this.getClient();
      return await client.getCoreApi();
    } catch (error) {
      // If it's already an AzureDevOpsError, rethrow it
      if (error instanceof AzureDevOpsError) {
        throw error;
      }
      // Otherwise, wrap it in an AzureDevOpsAuthenticationError
      throw new AzureDevOpsAuthenticationError(
        error instanceof Error
          ? `Failed to get Core API: ${error.message}`
          : 'Failed to get Core API: Unknown error',
      );
    }
  }

  /**
   * Get the Git API
   *
   * @returns The Git API client
   * @throws {AzureDevOpsAuthenticationError} If authentication fails
   */
  public async getGitApi(): Promise<IGitApi> {
    try {
      const client = await this.getClient();
      return await client.getGitApi();
    } catch (error) {
      // If it's already an AzureDevOpsError, rethrow it
      if (error instanceof AzureDevOpsError) {
        throw error;
      }
      // Otherwise, wrap it in an AzureDevOpsAuthenticationError
      throw new AzureDevOpsAuthenticationError(
        error instanceof Error
          ? `Failed to get Git API: ${error.message}`
          : 'Failed to get Git API: Unknown error',
      );
    }
  }

  /**
   * Get the Work Item Tracking API
   *
   * @returns The Work Item Tracking API client
   * @throws {AzureDevOpsAuthenticationError} If authentication fails
   */
  public async getWorkItemTrackingApi(): Promise<IWorkItemTrackingApi> {
    try {
      const client = await this.getClient();
      return await client.getWorkItemTrackingApi();
    } catch (error) {
      // If it's already an AzureDevOpsError, rethrow it
      if (error instanceof AzureDevOpsError) {
        throw error;
      }
      // Otherwise, wrap it in an AzureDevOpsAuthenticationError
      throw new AzureDevOpsAuthenticationError(
        error instanceof Error
          ? `Failed to get Work Item Tracking API: ${error.message}`
          : 'Failed to get Work Item Tracking API: Unknown error',
      );
    }
  }

  /**
   * Get the Build API
   *
   * @returns The Build API client
   * @throws {AzureDevOpsAuthenticationError} If authentication fails
   */
  public async getBuildApi(): Promise<IBuildApi> {
    try {
      const client = await this.getClient();
      return await client.getBuildApi();
    } catch (error) {
      // If it's already an AzureDevOpsError, rethrow it
      if (error instanceof AzureDevOpsError) {
        throw error;
      }
      // Otherwise, wrap it in an AzureDevOpsAuthenticationError
      throw new AzureDevOpsAuthenticationError(
        error instanceof Error
          ? `Failed to get Build API: ${error.message}`
          : 'Failed to get Build API: Unknown error',
      );
    }
  }

  /**
   * Get the Test API
   *
   * @returns The Test API client
   * @throws {AzureDevOpsAuthenticationError} If authentication fails
   */
  public async getTestApi(): Promise<ITestApi> {
    try {
      const client = await this.getClient();
      return await client.getTestApi();
    } catch (error) {
      // If it's already an AzureDevOpsError, rethrow it
      if (error instanceof AzureDevOpsError) {
        throw error;
      }
      // Otherwise, wrap it in an AzureDevOpsAuthenticationError
      throw new AzureDevOpsAuthenticationError(
        error instanceof Error
          ? `Failed to get Test API: ${error.message}`
          : 'Failed to get Test API: Unknown error',
      );
    }
  }

  /**
   * Get the Release API
   *
   * @returns The Release API client
   * @throws {AzureDevOpsAuthenticationError} If authentication fails
   */
  public async getReleaseApi(): Promise<IReleaseApi> {
    try {
      const client = await this.getClient();
      return await client.getReleaseApi();
    } catch (error) {
      // If it's already an AzureDevOpsError, rethrow it
      if (error instanceof AzureDevOpsError) {
        throw error;
      }
      // Otherwise, wrap it in an AzureDevOpsAuthenticationError
      throw new AzureDevOpsAuthenticationError(
        error instanceof Error
          ? `Failed to get Release API: ${error.message}`
          : 'Failed to get Release API: Unknown error',
      );
    }
  }

  /**
   * Get the Task Agent API
   *
   * @returns The Task Agent API client
   * @throws {AzureDevOpsAuthenticationError} If authentication fails
   */
  public async getTaskAgentApi(): Promise<ITaskAgentApi> {
    try {
      const client = await this.getClient();
      return await client.getTaskAgentApi();
    } catch (error) {
      // If it's already an AzureDevOpsError, rethrow it
      if (error instanceof AzureDevOpsError) {
        throw error;
      }
      // Otherwise, wrap it in an AzureDevOpsAuthenticationError
      throw new AzureDevOpsAuthenticationError(
        error instanceof Error
          ? `Failed to get Task Agent API: ${error.message}`
          : 'Failed to get Task Agent API: Unknown error',
      );
    }
  }

  /**
   * Get the Task API
   *
   * @returns The Task API client
   * @throws {AzureDevOpsAuthenticationError} If authentication fails
   */
  public async getTaskApi(): Promise<ITaskApi> {
    try {
      const client = await this.getClient();
      return await client.getTaskApi();
    } catch (error) {
      // If it's already an AzureDevOpsError, rethrow it
      if (error instanceof AzureDevOpsError) {
        throw error;
      }
      // Otherwise, wrap it in an AzureDevOpsAuthenticationError
      throw new AzureDevOpsAuthenticationError(
        error instanceof Error
          ? `Failed to get Task API: ${error.message}`
          : 'Failed to get Task API: Unknown error',
      );
    }
  }

  /**
   * Get the Profile API
   *
   * @returns The Profile API client
   * @throws {AzureDevOpsAuthenticationError} If authentication fails
   */
  public async getProfileApi(): Promise<any> {
    try {
      const client = await this.getClient();
      return await client.getProfileApi();
    } catch (error) {
      // If it's already an AzureDevOpsError, rethrow it
      if (error instanceof AzureDevOpsError) {
        throw error;
      }
      // Otherwise, wrap it in an AzureDevOpsAuthenticationError
      throw new AzureDevOpsAuthenticationError(
        error instanceof Error
          ? `Failed to get Profile API: ${error.message}`
          : 'Failed to get Profile API: Unknown error',
      );
    }
  }
}
