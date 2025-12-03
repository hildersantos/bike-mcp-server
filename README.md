# Bike MCP Server

MCP (Model Context Protocol) server for [Bike](https://www.hogbaysoftware.com/bike/) outliner app on macOS.

## Features

### Phase 1 ✅
- `bike_get_document_outline` - Read the structure of the current document

### Phase 2 ✅
- `bike_list_documents` - List all open documents
- `bike_create_document` - Create new documents
- `bike_create_row` - Add individual rows with positioning

### Planned (Phase 3-4)
- `bike_create_outline` - Create complete outline structure from JSON
- `bike_update_row` - Edit row content
- `bike_delete_row` - Remove rows
- `bike_group_rows` - Group/move multiple rows

## Requirements

- macOS (uses AppleScript)
- Node.js 18+
- Bike app installed

## Installation

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
