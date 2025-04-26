import { WebApi } from 'azure-devops-node-api';
import { createPipeline } from './feature';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

describe('createPipeline unit', () => {
  let mockConnection: WebApi;
  let mockPipelinesApi: any;

  beforeEach(() => {
    jest.resetAllMocks();

    mockPipelinesApi = {
      createPipeline: jest.fn(),
    };

    mockConnection = {
      serverUrl: 'https://dev.azure.com/testorg',
      getPipelinesApi: jest.fn().mockResolvedValue(mockPipelinesApi),
    } as unknown as WebApi;
  });

  test('should create a pipeline successfully', async () => {
    const mockPipeline = {
      id: 1,
      name: 'Test Pipeline',
      folder: 'Test Folder',
    };

    mockPipelinesApi.createPipeline.mockResolvedValue(mockPipeline);

    const result = await createPipeline(mockConnection, {
      projectId: 'testproject',
      name: 'Test Pipeline',
      configuration: {
        type: 'yaml',
        path: 'azure-pipelines.yml',
        repository: {
          id: 'repo-id',
          type: 'git',
          name: 'test-repo',
        },
      },
    });

    expect(mockConnection.getPipelinesApi).toHaveBeenCalled();
    expect(mockPipelinesApi.createPipeline).toHaveBeenCalled();
    expect(result).toEqual(mockPipeline);
  });

  test('should handle authentication errors', async () => {
    const authError = new Error('Authentication failed');
    authError.message = 'Authentication failed: Unauthorized';
    mockPipelinesApi.createPipeline.mockRejectedValue(authError);

    await expect(
      createPipeline(mockConnection, {
        projectId: 'testproject',
        name: 'Test Pipeline',
        configuration: {
          type: 'yaml',
          path: 'azure-pipelines.yml',
          repository: {
            id: 'repo-id',
            type: 'git',
            name: 'test-repo',
          },
        },
      }),
    ).rejects.toThrow(AzureDevOpsAuthenticationError);
  });

  test('should handle resource not found errors', async () => {
    const notFoundError = new Error('Not found');
    notFoundError.message = 'Project or repository not found';
    mockPipelinesApi.createPipeline.mockRejectedValue(notFoundError);

    await expect(
      createPipeline(mockConnection, {
        projectId: 'testproject',
        name: 'Test Pipeline',
        configuration: {
          type: 'yaml',
          path: 'azure-pipelines.yml',
          repository: {
            id: 'repo-id',
            type: 'git',
            name: 'test-repo',
          },
        },
      }),
    ).rejects.toThrow(AzureDevOpsResourceNotFoundError);
  });

  test('should wrap general errors in AzureDevOpsError', async () => {
    const testError = new Error('Test API error');
    mockPipelinesApi.createPipeline.mockRejectedValue(testError);

    await expect(
      createPipeline(mockConnection, {
        projectId: 'testproject',
        name: 'Test Pipeline',
        configuration: {
          type: 'yaml',
          path: 'azure-pipelines.yml',
          repository: {
            id: 'repo-id',
            type: 'git',
            name: 'test-repo',
          },
        },
      }),
    ).rejects.toThrow(AzureDevOpsError);
  });
});
