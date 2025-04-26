# Azure DevOps Pull Requests Tools

This document describes the tools available for working with Azure DevOps Pull Requests.

## create_pull_request

Creates a new pull request in a specific Git repository.

### Description

The `create_pull_request` tool creates a new pull request in a specified Azure DevOps Git repository. It allows you to propose changes from a source branch to a target branch, add a title, description, reviewers, and link to work items. Pull requests are a key part of code review and collaboration workflows in Azure DevOps.

### Parameters

```json
{
  "projectId": "MyProject", // Required: The ID or name of the project
  "repositoryId": "MyRepo", // Required: The ID or name of the repository
  "title": "Update feature X", // Required: The title of the pull request
  "sourceRefName": "refs/heads/feature-branch", // Required: The source branch name
  "targetRefName": "refs/heads/main", // Required: The target branch name
  "description": "This PR implements feature X", // Optional: The description of the pull request
  "reviewers": ["user@example.com"], // Optional: List of reviewer email addresses or IDs
  "isDraft": true, // Optional: Whether the pull request should be created as a draft
  "workItemRefs": [123, 456] // Optional: List of work item IDs to link to the pull request
}
```

| Parameter       | Type     | Required | Description                                                    |
| --------------- | -------- | -------- | -------------------------------------------------------------- |
| `projectId`     | string   | Yes      | The ID or name of the project containing the repository        |
| `repositoryId`  | string   | Yes      | The ID or name of the repository to create the pull request in |
| `title`         | string   | Yes      | The title of the pull request                                  |
| `sourceRefName` | string   | Yes      | The source branch name (e.g., "refs/heads/feature-branch")     |
| `targetRefName` | string   | Yes      | The target branch name (e.g., "refs/heads/main")               |
| `description`   | string   | No       | The description of the pull request                            |
| `reviewers`     | string[] | No       | List of reviewer email addresses or IDs                        |
| `isDraft`       | boolean  | No       | Whether the pull request should be created as a draft          |
| `workItemRefs`  | number[] | No       | List of work item IDs to link to the pull request              |

### Response

The tool returns a `PullRequest` object containing:

- `pullRequestId`: The unique identifier of the created pull request
- `status`: The status of the pull request (active, abandoned, completed)
- `createdBy`: Information about the user who created the pull request
- `creationDate`: The date and time when the pull request was created
- `title`: The title of the pull request
- `description`: The description of the pull request
- `sourceRefName`: The source branch name
- `targetRefName`: The target branch name
- `mergeStatus`: The merge status of the pull request
- And various other fields and references

Example response:

```json
{
  "repository": {
    "id": "repo-guid",
    "name": "MyRepo",
    "url": "https://dev.azure.com/organization/MyProject/_apis/git/repositories/MyRepo",
    "project": {
      "id": "project-guid",
      "name": "MyProject"
    }
  },
  "pullRequestId": 42,
  "codeReviewId": 42,
  "status": 1,
  "createdBy": {
    "displayName": "John Doe",
    "id": "user-guid",
    "uniqueName": "john.doe@example.com"
  },
  "creationDate": "2023-01-01T12:00:00Z",
  "title": "Update feature X",
  "description": "This PR implements feature X",
  "sourceRefName": "refs/heads/feature-branch",
  "targetRefName": "refs/heads/main",
  "mergeStatus": 1,
  "isDraft": true,
  "reviewers": [
    {
      "displayName": "Jane Smith",
      "id": "reviewer-guid",
      "uniqueName": "jane.smith@example.com",
      "voteResult": 0
    }
  ],
  "url": "https://dev.azure.com/organization/MyProject/_apis/git/repositories/MyRepo/pullRequests/42"
}
```

### Error Handling

The tool may throw the following errors:

- ValidationError: If required parameters are missing or invalid
- AuthenticationError: If authentication fails
- PermissionError: If the user doesn't have permission to create a pull request
- ResourceNotFoundError: If the project, repository, or specified branches don't exist
- GitError: For Git-related errors (e.g., conflicts, branch issues)
- GeneralError: For other unexpected errors

Error messages will include details about what went wrong and suggestions for resolution.

### Example Usage

```typescript
// Basic example - create a PR from feature branch to main
const pr = await mcpClient.callTool('create_pull_request', {
  projectId: 'MyProject',
  repositoryId: 'MyRepo',
  title: 'Add new feature',
  sourceRefName: 'refs/heads/feature-branch',
  targetRefName: 'refs/heads/main',
});
console.log(`Created PR #${pr.pullRequestId}: ${pr.url}`);

// Create a draft PR with description and reviewers
const draftPr = await mcpClient.callTool('create_pull_request', {
  projectId: 'MyProject',
  repositoryId: 'MyRepo',
  title: 'WIP: Refactor authentication code',
  description:
    '# Work in Progress\n\nRefactoring authentication code to use the new identity service.',
  sourceRefName: 'refs/heads/auth-refactor',
  targetRefName: 'refs/heads/develop',
  isDraft: true,
  reviewers: ['jane.smith@example.com', 'security-team@example.com'],
});
console.log(`Created draft PR #${draftPr.pullRequestId}`);

// Create a PR linked to work items
const linkedPr = await mcpClient.callTool('create_pull_request', {
  projectId: 'MyProject',
  repositoryId: 'MyRepo',
  title: 'Fix bugs in payment processor',
  sourceRefName: 'refs/heads/bugfix/payment',
  targetRefName: 'refs/heads/main',
  workItemRefs: [1234, 1235, 1236],
});
console.log(`Created PR #${linkedPr.pullRequestId} linked to work items`);
```

## list_pull_requests

Lists pull requests in a specific Git repository with optional filtering.

### Description

The `list_pull_requests` tool retrieves pull requests from a specified Azure DevOps Git repository. It supports filtering by status (active, completed, abandoned), creator, reviewer, and source/target branches. This tool is useful for monitoring code review progress, identifying pending PRs, and automating PR-related workflows.

### Parameters

```json
{
  "projectId": "MyProject", // Required: The ID or name of the project
  "repositoryId": "MyRepo", // Required: The ID or name of the repository
  "status": "active", // Optional: The status of pull requests to return (active, completed, abandoned, all)
  "creatorId": "user@example.com", // Optional: Filter by creator ID or email
  "reviewerId": "reviewer@example.com", // Optional: Filter by reviewer ID or email
  "sourceRefName": "refs/heads/feature-branch", // Optional: Filter by source branch name
  "targetRefName": "refs/heads/main", // Optional: Filter by target branch name
  "top": 10 // Optional: Maximum number of pull requests to return
}
```

| Parameter       | Type   | Required | Description                                                                         |
| --------------- | ------ | -------- | ----------------------------------------------------------------------------------- |
| `projectId`     | string | Yes      | The ID or name of the project containing the repository                             |
| `repositoryId`  | string | Yes      | The ID or name of the repository to list pull requests from                         |
| `status`        | string | No       | The status of pull requests to return: "active", "completed", "abandoned", or "all" |
| `creatorId`     | string | No       | Filter pull requests by creator ID or email                                         |
| `reviewerId`    | string | No       | Filter pull requests by reviewer ID or email                                        |
| `sourceRefName` | string | No       | Filter pull requests by source branch name                                          |
| `targetRefName` | string | No       | Filter pull requests by target branch name                                          |
| `top`           | number | No       | Maximum number of pull requests to return                                           |

### Response

The tool returns an array of `PullRequest` objects, each containing:

- `pullRequestId`: The unique identifier of the pull request
- `title`: The title of the pull request
- `status`: The status of the pull request (active, abandoned, completed)
- `createdBy`: Information about the user who created the pull request
- `creationDate`: The date and time when the pull request was created
- `sourceRefName`: The source branch name
- `targetRefName`: The target branch name
- And various other fields and references

Example response:

```json
[
  {
    "repository": {
      "id": "repo-guid",
      "name": "MyRepo",
      "project": {
        "id": "project-guid",
        "name": "MyProject"
      }
    },
    "pullRequestId": 42,
    "codeReviewId": 42,
    "status": 1,
    "createdBy": {
      "displayName": "John Doe",
      "uniqueName": "john.doe@example.com"
    },
    "creationDate": "2023-01-01T12:00:00Z",
    "title": "Update feature X",
    "description": "This PR implements feature X",
    "sourceRefName": "refs/heads/feature-branch",
    "targetRefName": "refs/heads/main",
    "mergeStatus": 3,
    "isDraft": false,
    "url": "https://dev.azure.com/organization/MyProject/_apis/git/repositories/MyRepo/pullRequests/42"
  },
  {
    "repository": {
      "id": "repo-guid",
      "name": "MyRepo",
      "project": {
        "id": "project-guid",
        "name": "MyProject"
      }
    },
    "pullRequestId": 43,
    "codeReviewId": 43,
    "status": 1,
    "createdBy": {
      "displayName": "Jane Smith",
      "uniqueName": "jane.smith@example.com"
    },
    "creationDate": "2023-01-02T14:30:00Z",
    "title": "Fix bug in login flow",
    "description": "This PR fixes a critical bug in the login flow",
    "sourceRefName": "refs/heads/bugfix/login",
    "targetRefName": "refs/heads/main",
    "mergeStatus": 3,
    "isDraft": false,
    "url": "https://dev.azure.com/organization/MyProject/_apis/git/repositories/MyRepo/pullRequests/43"
  }
]
```

### Error Handling

The tool may throw the following errors:

- ValidationError: If required parameters are missing or invalid
- AuthenticationError: If authentication fails
- PermissionError: If the user doesn't have permission to list pull requests
- ResourceNotFoundError: If the project or repository doesn't exist
- GeneralError: For other unexpected errors

Error messages will include details about what went wrong and suggestions for resolution.

### Example Usage

```typescript
// List all active pull requests in a repository
const activePRs = await mcpClient.callTool('list_pull_requests', {
  projectId: 'MyProject',
  repositoryId: 'MyRepo',
  status: 'active',
});
console.log(`Found ${activePRs.length} active pull requests`);

// List pull requests created by a specific user
const userPRs = await mcpClient.callTool('list_pull_requests', {
  projectId: 'MyProject',
  repositoryId: 'MyRepo',
  creatorId: 'john.doe@example.com',
});
console.log(`Found ${userPRs.length} pull requests created by John Doe`);

// List pull requests targeting a specific branch
const mainPRs = await mcpClient.callTool('list_pull_requests', {
  projectId: 'MyProject',
  repositoryId: 'MyRepo',
  targetRefName: 'refs/heads/main',
});
console.log(`Found ${mainPRs.length} pull requests targeting main branch`);

// Paginate through pull requests
const page1 = await mcpClient.callTool('list_pull_requests', {
  projectId: 'MyProject',
  repositoryId: 'MyRepo',
  top: 10,
});
const page2 = await mcpClient.callTool('list_pull_requests', {
  projectId: 'MyProject',
  repositoryId: 'MyRepo',
  top: 10,
});
console.log(
  `Retrieved ${page1.length + page2.length} pull requests in 2 pages`,
);
```

### Implementation Details

The `list_pull_requests` tool:

1. Establishes a connection to Azure DevOps using the provided credentials
2. Retrieves the Git API client
3. Constructs a search criteria object based on the provided filters
4. Maps status strings to Azure DevOps PullRequestStatus enum values
5. Makes the API call to retrieve the pull requests
6. Returns the results or an empty array if none are found
7. Handles errors and provides meaningful error messages

This implementation provides a robust and flexible way to retrieve pull requests from Azure DevOps repositories.

