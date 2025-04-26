# Azure DevOps Wiki Tools

This document describes the tools available for working with Azure DevOps wikis.

## get_wikis

Lists all wikis in a project or organization.

### Description

The `get_wikis` tool retrieves all wikis available in a specified Azure DevOps project or organization. This is useful for discovering which wikis are available before working with specific wiki pages.

### Parameters

- `organizationId` (optional): The ID or name of the organization. If not provided, the default organization from environment settings will be used.
- `projectId` (optional): The ID or name of the project. If not provided, the default project from environment settings will be used.

```json
{
  "organizationId": "MyOrganization",
  "projectId": "MyProject"
}
```

### Response

The tool returns an array of wiki objects, each containing:

- `id`: The unique identifier of the wiki
- `name`: The name of the wiki
- `url`: The URL of the wiki
- Other wiki properties such as `remoteUrl` and `type`

Example response:

```json
[
  {
    "id": "wiki1-id",
    "name": "MyWiki",
    "type": "projectWiki",
    "url": "https://dev.azure.com/MyOrganization/MyProject/_wiki/wikis/MyWiki",
    "remoteUrl": "https://dev.azure.com/MyOrganization/MyProject/_git/MyWiki"
  }
]
```

## get_wiki_page

Gets the content of a specific wiki page.

### Description

The `get_wiki_page` tool retrieves the content of a specified wiki page as plain text. This is useful for viewing the content of wiki pages programmatically.

### Parameters

- `organizationId` (optional): The ID or name of the organization. If not provided, the default organization from environment settings will be used.
- `projectId` (optional): The ID or name of the project. If not provided, the default project from environment settings will be used.
- `wikiId` (required): The ID or name of the wiki containing the page.
- `pagePath` (required): The path of the page within the wiki (e.g., "/Home" or "/Folder/Page").

```json
{
  "organizationId": "MyOrganization",
  "projectId": "MyProject",
  "wikiId": "MyWiki",
  "pagePath": "/Home"
}
```

### Response

The tool returns the content of the wiki page as a string in markdown format.

Example response:

```markdown
# Welcome to the Wiki

This is the home page of the wiki.

## Getting Started

Here are some links to help you get started:
- [Documentation](/Documentation)
- [Tutorials](/Tutorials)
- [FAQ](/FAQ)
```

### Error Handling

The tool may throw the following errors:

- `AzureDevOpsResourceNotFoundError`: If the specified wiki or page does not exist
- `AzureDevOpsPermissionError`: If the authenticated user does not have permission to access the wiki
- General errors: If other unexpected errors occur during the request

### Example Usage

```typescript
// Example MCP client call
const result = await mcpClient.callTool('get_wiki_page', {
  projectId: 'MyProject',
  wikiId: 'MyWiki',
  pagePath: '/Home'
});
console.log(result);
```

### Implementation Details

This tool uses the Azure DevOps REST API to retrieve the wiki page content with the `Accept: text/plain` header to get the content directly in text format. The page path is properly encoded to handle spaces and special characters in the URL. 