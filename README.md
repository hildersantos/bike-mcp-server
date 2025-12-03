# Bike MCP Server

MCP (Model Context Protocol) server for [Bike](https://www.hogbaysoftware.com/bike/) outliner app on macOS.

## Features

### Reading
- `bike_list_documents` - List all open documents
- `bike_get_document_outline` - Read document structure (supports max_depth)
- `bike_query_rows` - Search rows using Bike's outline path syntax

### Writing
- `bike_create_document` - Create new documents with optional structure
- `bike_create_rows` - Add rows with nested children and positioning
- `bike_update_row` - Edit row content and type (batch support)
- `bike_delete_row` - Remove rows (batch support)
- `bike_group_rows` - Group/move multiple rows under a parent

## Requirements

- macOS (uses AppleScript)
- Node.js 18+
- Bike app installed

## Installation

### Via Desktop Extension (recommended)

1. Download `bike-mcp-server.mcpb` from [releases](https://github.com/hildersantos/bike-mcp-server/releases)
2. Double-click the file to open with Claude Desktop
3. Click Install

### From source

```bash
cd bike-mcp-server
npm install
npm run build
```

## Usage with Claude Desktop

Add to your Claude Desktop config file (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "bike": {
      "command": "node",
      "args": ["/path/to/bike-mcp-server/dist/index.js"]
    }
  }
}
```

Then restart Claude Desktop.

## Development

```bash
# Watch mode for development
npm run dev

# Build
npm run build

# Run directly
npm start
```

## How It Works

The server communicates with Bike via AppleScript, using the `osascript` command. All operations require Bike to be running with a document open.

The outline structure is returned as human-readable indented text:

```
My Document (doc:abc123)

- First item [row:row-1]
  - Sub-item [row:row-1-1]
- Second item [row:row-2]
```

## License

MIT
