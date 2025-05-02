import { Environment } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';

/**
 * Options for creating an environment
 */
export interface CreateEnvironmentOptions {
  projectId: string;
  name: string;
  description?: string;
}

/**
 * Options for updating an environment
 */
export interface UpdateEnvironmentOptions {
  projectId: string;
  environmentId: number;
  name?: string;
  description?: string;
}

/**
 * Options for deleting an environment
 */
export interface DeleteEnvironmentOptions {
  projectId: string;
  environmentId: number;
}

export { Environment };
