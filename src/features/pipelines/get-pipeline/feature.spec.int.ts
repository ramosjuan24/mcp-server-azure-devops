import { WebApi } from 'azure-devops-node-api';
import { getPipeline } from './feature';
import { listPipelines } from '../list-pipelines/feature';
import {
  getTestConnection,
  shouldSkipIntegrationTest,
} from '../../../shared/test/test-helpers';

describe('getPipeline integration', () => {
  let connection: WebApi | null = null;
  let projectId: string;
  let existingPipelineId: number | null = null;

  beforeAll(async () => {
    // Get a real connection using environment variables
    connection = await getTestConnection();

    // Get the project ID from environment variables, fallback to default
    projectId = process.env.AZURE_DEVOPS_DEFAULT_PROJECT || 'DefaultProject';

    // Skip if no connection or project is available
    if (shouldSkipIntegrationTest() || !connection || !projectId) {
      return;
    }

    // Try to get an existing pipeline ID for testing
    try {
      const pipelines = await listPipelines(connection, { projectId });
      if (pipelines.length > 0) {
        existingPipelineId = pipelines[0].id ?? null;
      }
    } catch (error) {
      console.log('Could not find existing pipelines for testing:', error);
    }
  });

  test('should get a pipeline by ID', async () => {
    // Skip if no connection, project, or pipeline ID is available
    if (
      shouldSkipIntegrationTest() ||
      !connection ||
      !projectId ||
      !existingPipelineId
    ) {
      console.log(
        'Skipping getPipeline integration test - no connection, project or existing pipeline available',
      );
      return;
    }

    // Act - make an API call to Azure DevOps
    const pipeline = await getPipeline(connection, {
      projectId,
      pipelineId: existingPipelineId,
    });

    // Assert
    expect(pipeline).toBeDefined();
    expect(pipeline.id).toBe(existingPipelineId);
    expect(pipeline.name).toBeDefined();
    expect(typeof pipeline.name).toBe('string');
    expect(pipeline.folder).toBeDefined();
    expect(pipeline.revision).toBeDefined();
    expect(pipeline.url).toBeDefined();
    expect(pipeline.url).toContain('_apis/pipelines');
  });

  test('should throw ResourceNotFoundError for non-existent pipeline', async () => {
    // Skip if no connection or project is available
    if (shouldSkipIntegrationTest() || !connection || !projectId) {
      console.log(
        'Skipping getPipeline error test - no connection or project available',
      );
      return;
    }

    // Use a very high ID that is unlikely to exist
    const nonExistentPipelineId = 999999;

    // Act & Assert - should throw a not found error
    await expect(
      getPipeline(connection, {
        projectId,
        pipelineId: nonExistentPipelineId,
      }),
    ).rejects.toThrow(/not found/);
  });
});
