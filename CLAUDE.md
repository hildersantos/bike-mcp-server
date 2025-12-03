# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

MCP (Model Context Protocol) server for the [Bike](https://www.hogbaysoftware.com/bike/) outliner app on macOS. The server exposes Bike's functionality as tools that AI assistants can use to read and manipulate outlines.

## Commands

```bash
npm run build      # Compile TypeScript to dist/
npm run dev        # Watch mode for development
npm start          # Run the compiled server
```

## Architecture

```
src/
├── index.ts              # MCP server setup, tool registration
├── schemas/document.ts   # Zod schemas for tool input validation
├── services/applescript.ts # AppleScript execution utilities
└── tools/document.ts     # Tool implementations (business logic)
```

### Core Flow

1. **Tool Registration** (`src/index.ts`): Registers MCP tools with the server, defines descriptions/schemas, and maps to implementation functions
2. **Input Validation** (`src/schemas/document.ts`): Zod schemas validate and type tool inputs
3. **AppleScript Execution** (`src/services/applescript.ts`): Executes multi-line AppleScript via `osascript`, handles result parsing
4. **Tool Logic** (`src/tools/document.ts`): Builds AppleScript strings dynamically based on input parameters

### AppleScript Pattern

All Bike interactions go through AppleScript. The `runAppleScriptMultiline` function splits scripts by line and passes each as a `-e` argument to `osascript`. This handles complex scripts better than single-line escaping.

### Row/Document ID Format

- Documents: `doc:XXX` (root row ID)
- Rows: `row:XXX` (row ID from Bike)

IDs are returned in human-readable format: `- Row text [row:XXX]`

## Available Tools

### Reading
- `bike_list_documents` - List all open documents
- `bike_get_document_outline` - Read document structure (supports max_depth)
- `bike_query_rows` - Search rows using Bike's outline path syntax

### Writing
- `bike_create_document` - Create new document with optional structure
- `bike_create_rows` - Add rows with nested children and positioning
- `bike_update_row` - Edit row content and type (batch support)
- `bike_delete_row` - Remove rows (batch support)
- `bike_group_rows` - Group/move multiple rows under a parent

## MCPB Packaging

The server can be packaged as an MCPB bundle for easy distribution:

```bash
npx @anthropic-ai/mcpb@latest pack . bike-mcp-server.mcpb
```

Files:
- `manifest.json` - Package manifest with metadata
- `bike_icon.png` - App icon for the package

## Testing

No test suite configured. Test manually by:
1. Building: `npm run build`
2. Configuring in Claude Desktop or running via MCP inspector
3. Ensuring Bike is running with a document open
