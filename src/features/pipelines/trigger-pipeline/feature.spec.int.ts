import { WebApi } from 'azure-devops-node-api';
import { triggerPipeline } from './feature';
import { listPipelines } from '../list-pipelines/feature';
import {
  getTestConnection,
  shouldSkipIntegrationTest,
} from '../../../shared/test/test-helpers';

describe('triggerPipeline integration', () => {
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

  test('should trigger a pipeline run', async () => {
    // Skip if no connection, project, or pipeline ID is available
    if (
      shouldSkipIntegrationTest() ||
      !connection ||
      !projectId ||
      !existingPipelineId
    ) {
      console.log(
        'Skipping triggerPipeline integration test - no connection, project or existing pipeline available',
      );
      return;
    }

    // Arrange - prepare options for running the pipeline
    const options = {
      projectId,
      pipelineId: existingPipelineId,
      // Use previewRun mode to avoid actually triggering pipelines during tests
      previewRun: true,
    };

    // Act - trigger the pipeline
    const run = await triggerPipeline(connection, options);

    // Assert - verify the response
    expect(run).toBeDefined();
    // Run ID should be present
    expect(run.id).toBeDefined();
    expect(typeof run.id).toBe('number');
    // Pipeline reference should match the pipeline we triggered
    expect(run.pipeline?.id).toBe(existingPipelineId);
    // URL should exist and point to the run
    expect(run.url).toBeDefined();
    expect(run.url).toContain('_apis/pipelines');
  });

  test('should trigger with custom branch', async () => {
    // Skip if no connection, project, or pipeline ID is available
    if (
      shouldSkipIntegrationTest() ||
      !connection ||
      !projectId ||
      !existingPipelineId
    ) {
      console.log(
        'Skipping triggerPipeline advanced test - no connection, project or existing pipeline available',
      );
      return;
    }

    // Arrange - prepare options with a branch
    const options = {
      projectId,
      pipelineId: existingPipelineId,
      branch: 'main', // Use the main branch
      // Use previewRun mode to avoid actually triggering pipelines during tests
      previewRun: true,
    };

    // Act - trigger the pipeline with custom options
    const run = await triggerPipeline(connection, options);

    // Assert - verify the response
    expect(run).toBeDefined();
    expect(run.id).toBeDefined();
    // Resources should include the specified branch
    expect(run.resources?.repositories?.self?.refName).toBe('refs/heads/main');
  });

  test('should handle non-existent pipeline', async () => {
    // Skip if no connection or project is available
    if (shouldSkipIntegrationTest() || !connection || !projectId) {
      console.log(
        'Skipping triggerPipeline error test - no connection or project available',
      );
      return;
    }

    // Use a very high ID that is unlikely to exist
    const nonExistentPipelineId = 999999;

    try {
      // Attempt to trigger a pipeline that shouldn't exist
      await triggerPipeline(connection, {
        projectId,
        pipelineId: nonExistentPipelineId,
      });
      // If we reach here without an error, we'll fail the test
      fail(
        'Expected triggerPipeline to throw an error for non-existent pipeline',
      );
    } catch (error) {
      // We expect an error, so this test passes if we get here
      expect(error).toBeDefined();
      // Note: the exact error type might vary depending on the API response
    }
  });
});
