import { WebApi } from 'azure-devops-node-api';
import { deletePipeline } from './feature';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

describe('deletePipeline unit', () => {
  let mockConnection: WebApi;
  let mockRestClient: any;

  beforeEach(() => {
    jest.resetAllMocks();

    mockRestClient = {
      del: jest.fn(),
    };

    mockConnection = {
      serverUrl: 'https://dev.azure.com/testorg',
      rest: mockRestClient,
    } as unknown as WebApi;
  });

  test('should delete a pipeline successfully', async () => {
    mockRestClient.del.mockResolvedValue(undefined);

    await deletePipeline(mockConnection, {
      projectId: 'testproject',
      pipelineId: 1,
    });

    expect(mockRestClient.del).toHaveBeenCalledWith(
      '/testproject/_apis/pipelines/1',
    );
  });

  test('should handle authentication errors', async () => {
    const authError = new Error('Authentication failed: Unauthorized');
    mockRestClient.del.mockRejectedValue(authError);

    await expect(
      deletePipeline(mockConnection, {
        projectId: 'testproject',
        pipelineId: 1,
      }),
    ).rejects.toThrow(AzureDevOpsAuthenticationError);
  });

  test('should handle resource not found errors', async () => {
    const notFoundError = new Error('Pipeline not found');
    mockRestClient.del.mockRejectedValue(notFoundError);

    await expect(
      deletePipeline(mockConnection, {
        projectId: 'testproject',
        pipelineId: 1,
      }),
    ).rejects.toThrow(AzureDevOpsResourceNotFoundError);
  });

  test('should wrap general errors in AzureDevOpsError', async () => {
    const testError = new Error('Test API error');
    mockRestClient.del.mockRejectedValue(testError);

    await expect(
      deletePipeline(mockConnection, {
        projectId: 'testproject',
        pipelineId: 1,
      }),
    ).rejects.toThrow(AzureDevOpsError);
  });
});
