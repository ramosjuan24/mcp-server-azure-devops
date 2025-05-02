import { WebApi } from 'azure-devops-node-api';
import { deletePipeline } from './feature';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

describe('deletePipeline unit', () => {
  let mockConnection: WebApi;
  let mockPipelinesApi: any;

  beforeEach(() => {
    jest.resetAllMocks();

    mockPipelinesApi = {
      deletePipeline: jest.fn(),
    };

    mockConnection = {
      serverUrl: 'https://dev.azure.com/testorg',
      getPipelinesApi: jest.fn().mockResolvedValue(mockPipelinesApi),
    } as unknown as WebApi;
  });

  test('should delete a pipeline successfully', async () => {
    mockPipelinesApi.deletePipeline.mockResolvedValue(undefined);

    await deletePipeline(mockConnection, {
      projectId: 'testproject',
      pipelineId: 1,
    });

    expect(mockConnection.getPipelinesApi).toHaveBeenCalled();
    expect(mockPipelinesApi.deletePipeline).toHaveBeenCalledWith(
      'testproject',
      1,
    );
  });

  test('should handle authentication errors', async () => {
    const authError = new Error('Authentication failed');
    authError.message = 'Authentication failed: Unauthorized';
    mockPipelinesApi.deletePipeline.mockRejectedValue(authError);

    await expect(
      deletePipeline(mockConnection, {
        projectId: 'testproject',
        pipelineId: 1,
      }),
    ).rejects.toThrow(AzureDevOpsAuthenticationError);
  });

  test('should handle resource not found errors', async () => {
    const notFoundError = new Error('Not found');
    notFoundError.message = 'Pipeline not found';
    mockPipelinesApi.deletePipeline.mockRejectedValue(notFoundError);

    await expect(
      deletePipeline(mockConnection, {
        projectId: 'testproject',
        pipelineId: 1,
      }),
    ).rejects.toThrow(AzureDevOpsResourceNotFoundError);
  });

  test('should wrap general errors in AzureDevOpsError', async () => {
    const testError = new Error('Test API error');
    mockPipelinesApi.deletePipeline.mockRejectedValue(testError);

    await expect(
      deletePipeline(mockConnection, {
        projectId: 'testproject',
        pipelineId: 1,
      }),
    ).rejects.toThrow(AzureDevOpsError);
  });
});
