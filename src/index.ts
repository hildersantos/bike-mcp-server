import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListDocumentsInputSchema, GetDocumentOutlineInputSchema, CreateDocumentInputSchema, CreateRowsInputSchema, GroupRowsInputSchema, UpdateRowInputSchema, DeleteRowInputSchema, QueryRowsInputSchema } from "./schemas/document.js";
import { listDocuments, getDocumentOutline, createDocument, createRows, groupRows, updateRows, deleteRows, queryRows } from "./tools/document.js";

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
    description: `Creates a new document in Bike, optionally with an outline structure.

Args:
  - structure (array, optional): Outline structure to populate the document.
    Each node can have:
    - name (string): Text content
    - type (string, optional): Row type (body, heading, task, code, quote, note, unordered, ordered, hr)
    - children (array, optional): Nested child nodes
    If not provided, creates an empty document.

Returns:
  Document info: "Untitled (doc:XXX)"

Examples:
  - Empty doc: bike_create_document({})
  - With structure: bike_create_document({
      structure: [
        { name: "Project", type: "heading", children: [
          { name: "Task 1", type: "task" },
          { name: "Task 2", type: "task" }
        ]}
      ]
    })

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
      const result = await createDocument(params.structure);

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

// Register: create_rows
server.registerTool(
  "bike_create_rows",
  {
    title: "Create Bike Rows",
    description: `Creates one or more rows with optional nested structure.

Args:
  - structure (array, required): Array of rows to create. Each can have:
    - name (string): Text content
    - type (string, optional): Row type (body, heading, task, code, quote, note, unordered, ordered, hr)
    - children (array, optional): Nested child rows
  - parent_id (string, optional): Parent row ID. If not provided, adds to root.
  - position (string, optional): Where to insert - 'first', 'last' (default), 'before', 'after'
  - reference_id (string, optional): Required for 'before'/'after' positioning.

Returns:
  Confirmation: "Created N row(s)"

Examples:
  - Single row: bike_create_rows({ structure: [{ name: "New item" }] })
  - With type: bike_create_rows({ structure: [{ name: "Task", type: "task" }] })
  - Nested: bike_create_rows({ structure: [
      { name: "Parent", children: [{ name: "Child" }] }
    ] })
  - At position: bike_create_rows({
      structure: [{ name: "First!" }],
      position: "first"
    })
  - Before row: bike_create_rows({
      structure: [{ name: "Before X" }],
      position: "before",
      reference_id: "Kx9"
    })

Errors:
  - "Bike is not running" - Open Bike app first
  - "No document is open" - Open a document first
  - "reference_id is required" - When using before/after without reference_id`,
    inputSchema: CreateRowsInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async (params) => {
    try {
      const result = await createRows(
        params.structure,
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

// Register: group_rows
server.registerTool(
  "bike_group_rows",
  {
    title: "Group Rows",
    description: `Groups multiple rows under a new or existing parent row.

Two modes:
1. Create new group: Provide group_name to create a new parent row and move specified rows into it.
   By default, the group is created in-place (before the first row being grouped).
2. Move to existing: Provide parent_id to move rows into an existing row.

Use position ('first'/'last' for root, 'before'/'after' with reference_id) to override placement.`,
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

// Register: update_row
server.registerTool(
  "bike_update_row",
  {
    title: "Update Bike Rows",
    description: `Updates one or more rows' text content and/or type.

Args:
  - updates (array, required): Array of row updates. Each update has:
    - row_id (string, required): ID of the row to update
    - name (string, optional): New text content
    - type (string, optional): New row type (body, heading, quote, code, note, unordered, ordered, task, hr)

Returns:
  Confirmation: "Updated N row(s)"

Examples:
  - Single update: bike_update_row({ updates: [{ row_id: "Kx9", name: "New text" }] })
  - Batch to task: bike_update_row({ updates: [
      { row_id: "A1", type: "task" },
      { row_id: "B2", type: "task" },
      { row_id: "C3", type: "task" }
    ] })
  - Mixed: bike_update_row({ updates: [
      { row_id: "X", name: "Title", type: "heading" },
      { row_id: "Y", type: "task" }
    ] })

Errors:
  - "Bike is not running" - Open Bike app first
  - "No document is open" - Open a document first
  - "At least one of 'name' or 'type' must be provided" - Per row`,
    inputSchema: UpdateRowInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async (params) => {
    try {
      const result = await updateRows(params.updates);

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

// Register: delete_row
server.registerTool(
  "bike_delete_row",
  {
    title: "Delete Bike Rows",
    description: `Deletes one or more rows from the document.

WARNING: This is a destructive operation. Deleted rows and all their children
will be permanently removed. This action cannot be undone via the MCP server
(though Bike's undo may work if used immediately).

Args:
  - row_ids (string[], required): Array of row IDs to delete.

Returns:
  Confirmation with count:
  "Deleted 3 row(s)"

Examples:
  - Delete one row: bike_delete_row({ row_ids: ["Kx9"] })
  - Delete multiple: bike_delete_row({ row_ids: ["Kx9", "Lm2", "Np4"] })

Errors:
  - "Bike is not running" - Open Bike app first
  - "No document is open" - Open a document first`,
    inputSchema: DeleteRowInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async (params) => {
    try {
      const result = await deleteRows(params.row_ids);

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

// Register: query_rows
server.registerTool(
  "bike_query_rows",
  {
    title: "Query Bike Rows",
    description: `Search for rows using Bike's outline path syntax.

Outline paths are powerful queries for filtering rows:
  - /project          → Top-level rows containing "project"
  - //task            → All rows of type "task" (anywhere)
  - //@done           → Rows with @done attribute
  - //heading         → All heading rows
  - /a/b              → "b" rows inside "a" rows
  - /a union /b       → Rows matching "a" OR "b"
  - /a intersect /b   → Rows matching "a" AND "b"

Args:
  - outline_path (string, required): The outline path query.

Returns:
  Matching rows formatted as:
  - Row text [row:XXX]

  Or scalar result (count, boolean, text) depending on the query.

Examples:
  - Find all tasks: bike_query_rows({ outline_path: "//task" })
  - Find headings: bike_query_rows({ outline_path: "//heading" })
  - Find by text: bike_query_rows({ outline_path: "//project" })
  - Find with attribute: bike_query_rows({ outline_path: "//@done" })

Errors:
  - "Bike is not running" - Open Bike app first
  - "No document is open" - Open a document first`,
    inputSchema: QueryRowsInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async (params) => {
    try {
      const result = await queryRows(params.outline_path);

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
