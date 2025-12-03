import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListDocumentsInputSchema, GetDocumentOutlineInputSchema, CreateDocumentInputSchema, CreateRowInputSchema, CreateOutlineInputSchema, GroupRowsInputSchema } from "./schemas/document.js";
import { listDocuments, getDocumentOutline, createDocument, createRow, createOutline, groupRows } from "./tools/document.js";

// Create the MCP server
const server = new McpServer({
  name: "bike-mcp-server",
  version: "0.2.0",
});

// Register: list_documents
server.registerTool(
  "bike_list_documents",
  {
    title: "List Bike Documents",
    description: `Lists all open documents in Bike.

Returns a list of all currently open documents with their names and IDs.
The active (front) document is marked with an asterisk (*).
Bike must be running for this tool to work.

Args:
  None

Returns:
  List of documents, one per line (active marked with *):
  
  * Active Document (doc:abc123)
    Other Document (doc:def456)

Examples:
  - List all open docs: bike_list_documents({})

Errors:
  - "Bike is not running" - Open Bike app first
  - "No documents open" - No documents are currently open`,
    inputSchema: ListDocumentsInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async () => {
    try {
      const result = await listDocuments();

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error: ${message}`,
          },
        ],
      };
    }
  }
);

// Register: get_document_outline
server.registerTool(
  "bike_get_document_outline",
  {
    title: "Get Bike Document Outline",
    description: `Retrieves the complete outline structure of the currently open Bike document.

Returns a hierarchical tree of rows with their IDs, text content, and children.
Bike must be running with a document open for this tool to work.

Args:
  - max_depth (number, optional): Maximum depth of the outline tree to return.
    If not specified, returns the complete tree.

Returns:
  Human-readable indented outline with IDs:
  
  Document Name (doc:root-id)

  - First item [row:Kx9]
    - Sub-item 1 [row:Lm2]
    - Sub-item 2 [row:Np4]
  - Second item [row:Qr7]

Examples:
  - Get full outline: bike_get_document_outline({})
  - Get only 2 levels deep: bike_get_document_outline({ max_depth: 2 })

Errors:
  - "Bike is not running" - Open Bike app first
  - "No document is open" - Open a document in Bike first`,
    inputSchema: GetDocumentOutlineInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async (params) => {
    try {
      const outline = await getDocumentOutline(params.max_depth);

      return {
        content: [
          {
            type: "text",
            text: outline,
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error: ${message}`,
          },
        ],
      };
    }
  }
);

// Register: create_document
server.registerTool(
  "bike_create_document",
  {
    title: "Create Bike Document",
    description: `Creates a new document in Bike.

The document will be created and opened in Bike. If a name is provided, it becomes
the first row of the document (acting as a title). The document file remains untitled
until saved by the user.

Args:
  - name (string, optional): Title for the document. Creates a first row with this text.
    If not provided, creates an empty document.

Returns:
  Confirmation with document name and ID:
  "Document Name (doc:root-id)"

Examples:
  - Create empty: bike_create_document({})
  - Create with title: bike_create_document({ name: "Project Brainstorm" })

Errors:
  - "Bike is not running" - Open Bike app first`,
    inputSchema: CreateDocumentInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async (params) => {
    try {
      const result = await createDocument(params.name);

      return {
        content: [
          {
            type: "text",
            text: `Created document: ${result}`,
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error: ${message}`,
          },
        ],
      };
    }
  }
);

// Register: create_row
server.registerTool(
  "bike_create_row",
  {
    title: "Create Bike Row",
    description: `Creates a new row in the current Bike document.

Adds a row with the specified text content at the specified position.

Args:
  - name (string, required): Text content for the new row.
  - parent_id (string, optional): ID of the parent row. If not provided, adds to root level.
  - position (string, optional): Where to insert the row. Options:
    - "first": First child of parent (default if parent_id provided)
    - "last": Last child of parent (default)
    - "before": Before the reference_id row
    - "after": After the reference_id row
  - reference_id (string, optional): Required when position is "before" or "after".

Returns:
  Confirmation with row name and ID:
  "Created: Row text [row:XXX]"

Examples:
  - Add to end of document: bike_create_row({ name: "New item" })
  - Add as first child: bike_create_row({ name: "First", parent_id: "Lm9", position: "first" })
  - Add after specific row: bike_create_row({ name: "After this", position: "after", reference_id: "Np3" })

Errors:
  - "Bike is not running" - Open Bike app first
  - "No document is open" - Open a document first
  - "reference_id is required" - When using before/after without reference_id`,
    inputSchema: CreateRowInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async (params) => {
    try {
      const result = await createRow(
        params.name,
        params.parent_id,
        params.position,
        params.reference_id
      );

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error: ${message}`,
          },
        ],
      };
    }
  }
);

// Register: create_outline
server.registerTool(
  "bike_create_outline",
  {
    title: "Create Outline Structure",
    description: `Creates a complete outline structure from a nested JSON structure.

Example structure:
[
  {
    "name": "Chapter 1",
    "children": [
      { "name": "Section 1.1" },
      { "name": "Section 1.2", "children": [{ "name": "Subsection 1.2.1" }] }
    ]
  },
  { "name": "Chapter 2" }
]

Use parent_id to add the outline under an existing row.`,
    inputSchema: CreateOutlineInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async (params) => {
    try {
      const result = await createOutline(params.structure, params.parent_id);

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error: ${message}`,
          },
        ],
      };
    }
  }
);

// Register: group_rows
server.registerTool(
  "bike_group_rows",
  {
    title: "Group Rows",
    description: `Groups multiple rows under a new or existing parent row.

Two modes:
1. Create new group: Provide group_name to create a new parent row and move specified rows into it.
2. Move to existing: Provide parent_id to move rows into an existing row.

Use position and reference_id to control where the new group is created.`,
    inputSchema: GroupRowsInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async (params) => {
    try {
      const result = await groupRows(
        params.row_ids,
        params.group_name,
        params.parent_id,
        params.position,
        params.reference_id
      );

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error: ${message}`,
          },
        ],
      };
    }
  }
);

// Run the server with stdio transport
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Bike MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
