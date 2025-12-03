import { runAppleScriptMultiline, isBikeRunning, hasOpenDocument } from "../services/applescript.js";
import { escapeAppleScriptString, validateRowId, validateRowIds } from "../utils/sanitize.js";
import { structureToBikeXml } from "../utils/bikeXml.js";
import { OutlineNode } from "../schemas/document.js";

/**
 * Lists all open documents in Bike, marking the active one.
 */
export async function listDocuments(): Promise<string> {
  // Check if Bike is running
  if (!isBikeRunning()) {
    throw new Error("Bike is not running. Please open Bike first.");
  }

  const script = `
tell application "Bike"
  set docCount to count of documents
  if docCount is 0 then
    return "No documents open"
  end if
  
  set frontDocId to id of root row of front document
  
  set outputText to ""
  repeat with i from 1 to docCount
    set doc to document i
    set docName to name of doc
    set docId to id of root row of doc
    
    if docId is frontDocId then
      set outputText to outputText & "* " & docName & " (doc:" & docId & ")"
    else
      set outputText to outputText & "  " & docName & " (doc:" & docId & ")"
    end if
    
    if i < docCount then
      set outputText to outputText & linefeed
    end if
  end repeat
  
  return outputText
end tell
`;

  const result = runAppleScriptMultiline<string>(script);

  if (!result.success) {
    throw new Error(`Failed to list documents: ${result.error}`);
  }

  if (!result.data) {
    throw new Error("No data returned from Bike");
  }

  return result.data;
}

/**
 * Gets the outline of the current Bike document as human-readable indented text.
 */
export async function getDocumentOutline(maxDepth?: number): Promise<string> {
  // Check if Bike is running
  if (!isBikeRunning()) {
    throw new Error("Bike is not running. Please open Bike and a document first.");
  }

  // Check if there's an open document
  if (!hasOpenDocument()) {
    throw new Error("No document is open in Bike. Please open a document first.");
  }

  // AppleScript to get document info and build the outline tree
  // Outputs human-readable indented format with IDs
  const script = `
-- Recursive function to build outline text for a row and its children
on rowToOutline(r, indentLevel, maxD)
  tell application "Bike"
    set rowId to id of r
    set rowName to name of r
    set childRows to rows of r
    
    -- Build indentation (2 spaces per level)
    set indent to ""
    repeat indentLevel times
      set indent to indent & "  "
    end repeat
    
    -- Format: "- Row name [row:XXX]" with proper indentation
    set lineText to indent & "- " & rowName & " [row:" & rowId & "]" & linefeed
    
    -- Check depth limit
    if maxD is not -1 and indentLevel >= maxD then
      return lineText
    end if
    
    -- Process children
    repeat with childRow in childRows
      set lineText to lineText & my rowToOutline(childRow, indentLevel + 1, maxD)
    end repeat
    
    return lineText
  end tell
end rowToOutline

-- Main execution
tell application "Bike"
  set doc to front document
  set docName to name of doc
  set docId to id of root row of doc
  
  set maxDepthParam to ${maxDepth ?? -1}
  
  -- Build header
  set outputText to docName & " (doc:" & docId & ")" & linefeed & linefeed
  
  -- Process all top-level rows (children of root)
  set topRows to rows of root row of doc
  repeat with r in topRows
    set outputText to outputText & my rowToOutline(r, 0, maxDepthParam)
  end repeat
  
  return outputText
end tell
`;

  const result = runAppleScriptMultiline<string>(script);

  if (!result.success) {
    throw new Error(`Failed to get document outline: ${result.error}`);
  }

  if (!result.data) {
    throw new Error("No data returned from Bike");
  }

  return result.data;
}

/**
 * Creates a new Bike document, optionally populated with an outline structure.
 */
export async function createDocument(structure?: OutlineNode[], html = false): Promise<string> {
  if (!isBikeRunning()) {
    throw new Error("Bike is not running. Please open Bike first.");
  }

  const hasStructure = structure && structure.length > 0;

  if (hasStructure) {
    // Generate Bike XML and import it
    const bikeXml = structureToBikeXml(structure, html);
    const escapedXml = escapeAppleScriptString(bikeXml);

    const script = `
tell application "Bike"
  set newDoc to make document
  set docId to id of root row of newDoc

  tell newDoc
    import from "${escapedXml}" as bike format
  end tell

  set docName to name of newDoc
  return docName & " (doc:" & docId & ")"
end tell
`;

    const result = runAppleScriptMultiline<string>(script);

    if (!result.success) {
      throw new Error(`Failed to create document: ${result.error}`);
    }

    if (!result.data) {
      throw new Error("No data returned from Bike");
    }

    return result.data;
  } else {
    const script = `
tell application "Bike"
  set newDoc to make document
  set docId to id of root row of newDoc
  set docName to name of newDoc
  return docName & " (doc:" & docId & ")"
end tell
`;

    const result = runAppleScriptMultiline<string>(script);

    if (!result.success) {
      throw new Error(`Failed to create document: ${result.error}`);
    }

    if (!result.data) {
      throw new Error("No data returned from Bike");
    }

    return result.data;
  }
}

/**
 * Creates one or more rows with optional nested structure.
 * Supports positioning via position and reference_id.
 */
export async function createRows(
  structure: OutlineNode[],
  parentId?: string,
  position: "first" | "last" | "before" | "after" = "last",
  referenceId?: string,
  html = false
): Promise<string> {
  if (!isBikeRunning()) {
    throw new Error("Bike is not running. Please open Bike first.");
  }

  if (!hasOpenDocument()) {
    throw new Error("No document is open in Bike. Please open a document first.");
  }

  if ((position === "before" || position === "after") && !referenceId) {
    throw new Error("reference_id is required when position is 'before' or 'after'");
  }

  // Validate row IDs
  if (parentId) validateRowId(parentId);
  if (referenceId) validateRowId(referenceId);

  // Generate Bike XML
  const bikeXml = structureToBikeXml(structure, html);
  const escapedXml = escapeAppleScriptString(bikeXml);

  // Determine insert location for import command
  let importLocation: string;

  if (position === "before" && referenceId) {
    importLocation = `before row id "${referenceId}"`;
  } else if (position === "after" && referenceId) {
    importLocation = `after row id "${referenceId}"`;
  } else if (position === "first") {
    const target = parentId ? `row id "${parentId}"` : "root row";
    importLocation = `front of rows of ${target}`;
  } else {
    // default: last
    const target = parentId ? `row id "${parentId}"` : "root row";
    importLocation = `end of rows of ${target}`;
  }

  const script = `
tell application "Bike"
  tell front document
    import from "${escapedXml}" as bike format to ${importLocation}
    return "Created ${structure.length} row(s)"
  end tell
end tell
`;

  const result = runAppleScriptMultiline<string>(script);

  if (!result.success) {
    throw new Error(`Failed to create rows: ${result.error}`);
  }

  if (!result.data) {
    throw new Error("No data returned from Bike");
  }

  return result.data;
}

/**
 * Groups multiple rows under a new or existing parent row.
 */
export async function groupRows(
  rowIds: string[],
  groupName?: string,
  parentId?: string,
  position: "first" | "last" | "before" | "after" = "last",
  referenceId?: string
): Promise<string> {
  // Check if Bike is running
  if (!isBikeRunning()) {
    throw new Error("Bike is not running. Please open Bike first.");
  }

  // Check if there's an open document
  if (!hasOpenDocument()) {
    throw new Error("No document is open in Bike. Please open a document first.");
  }

  if (!groupName && !parentId) {
    throw new Error("Either group_name or parent_id must be provided");
  }

  // Validate row IDs
  const validatedRowIds = validateRowIds(rowIds);
  if (parentId) validateRowId(parentId);
  if (referenceId) validateRowId(referenceId);

  // Build the list of row IDs for AppleScript
  const rowIdList = validatedRowIds.map(id => `"${id}"`).join(", ");
  
  let script: string;

  if (parentId) {
    // Move rows to existing parent
    script = `
tell application "Bike"
  tell front document
    set targetParent to row id "${parentId}"
    set rowsToMove to {${rowIdList}}
    repeat with rowId in rowsToMove
      move row id rowId to end of rows of targetParent
    end repeat
    return "Moved " & (count of rowsToMove) & " rows to existing parent [row:${parentId}]"
  end tell
end tell
`;
  } else {
    // Create new group and move rows into it
    const escapedName = escapeAppleScriptString(groupName!);
    
    // Determine where to create the new group based on position
    let createGroupScript: string;
    
    if (position === "before" && referenceId) {
      createGroupScript = `
    set parentRow to container row of row id "${referenceId}"
    tell parentRow
      set newGroup to make row at (before row id "${referenceId}") with properties {name:"${escapedName}"}
    end tell`;
    } else if (position === "after" && referenceId) {
      createGroupScript = `
    set parentRow to container row of row id "${referenceId}"
    tell parentRow
      set newGroup to make row at (after row id "${referenceId}") with properties {name:"${escapedName}"}
    end tell`;
    } else if (position === "first") {
      createGroupScript = `
    set newGroup to make row at front of rows of root row with properties {name:"${escapedName}"}`;
    } else {
      // default: in-place (before first row being grouped)
      createGroupScript = `
    set firstRowId to first item of {${rowIdList}}
    set firstRow to row id firstRowId
    set parentRow to container row of firstRow
    tell parentRow
      set newGroup to make row at (before firstRow) with properties {name:"${escapedName}"}
    end tell`;
    }
    
    script = `
tell application "Bike"
  tell front document
    ${createGroupScript}
    set groupId to id of newGroup
    set rowsToMove to {${rowIdList}}
    repeat with rowId in rowsToMove
      move row id rowId to end of rows of newGroup
    end repeat
    return "Created group: ${escapedName} [row:" & groupId & "] with " & (count of rowsToMove) & " rows"
  end tell
end tell
`;
  }

  const result = runAppleScriptMultiline<string>(script);

  if (!result.success) {
    throw new Error(`Failed to group rows: ${result.error}`);
  }

  if (!result.data) {
    throw new Error("No data returned from Bike");
  }

  return result.data;
}

// Type for row update
interface RowUpdate {
  row_id: string;
  name?: string;
  type?: string;
  html?: boolean;
}

/**
 * Updates one or more rows' text content and/or type.
 * If html is true for a row, the name is treated as HTML and the row is replaced via import.
 */
export async function updateRows(updates: RowUpdate[]): Promise<string> {
  if (!isBikeRunning()) {
    throw new Error("Bike is not running. Please open Bike first.");
  }

  if (!hasOpenDocument()) {
    throw new Error("No document is open in Bike. Please open a document first.");
  }

  // Validate each update has at least name or type, and validate row IDs
  for (const update of updates) {
    validateRowId(update.row_id);
    if (update.name === undefined && update.type === undefined) {
      throw new Error(`Update for row ${update.row_id}: at least one of 'name' or 'type' must be provided`);
    }
  }

  // Separate HTML updates (need delete+import) from plain updates
  const plainUpdates = updates.filter(u => !u.html);
  const htmlUpdates = updates.filter(u => u.html && u.name !== undefined);

  let results: string[] = [];

  // Handle plain text updates with AppleScript
  if (plainUpdates.length > 0) {
    const updateStatements = plainUpdates.map(u => {
      const statements: string[] = [`set targetRow to row id "${u.row_id}"`];

      if (u.name !== undefined) {
        const escapedName = escapeAppleScriptString(u.name);
        statements.push(`set name of targetRow to "${escapedName}"`);
      }

      if (u.type !== undefined) {
        const normalizedType = u.type === "blockquote" ? "quote" : u.type;
        statements.push(`set type of targetRow to ${normalizedType}`);
      }

      return statements.join("\n    ");
    }).join("\n    ");

    const script = `
tell application "Bike"
  tell front document
    ${updateStatements}
    return "Updated ${plainUpdates.length} row(s)"
  end tell
end tell
`;

    const result = runAppleScriptMultiline<string>(script);
    if (!result.success) {
      throw new Error(`Failed to update rows: ${result.error}`);
    }
    results.push(`${plainUpdates.length} plain`);
  }

  // Handle HTML updates: delete old row, import new one at same position
  for (const update of htmlUpdates) {
    const nodeType = update.type === "blockquote" ? "quote" : (update.type || "body");
    const bikeXml = structureToBikeXml([{ name: update.name!, type: nodeType }], true);
    const escapedXml = escapeAppleScriptString(bikeXml);

    const script = `
tell application "Bike"
  tell front document
    set targetRow to row id "${update.row_id}"
    set nextRow to next sibling row of targetRow
    set parentRow to container row of targetRow

    -- Move children to parent temporarily (before targetRow)
    set childIds to {}
    repeat with childRow in rows of targetRow
      set end of childIds to id of childRow
    end repeat
    repeat with childId in childIds
      move row id childId to before targetRow
    end repeat

    -- Now delete the empty row and import new one
    if nextRow is not missing value then
      delete targetRow
      import from "${escapedXml}" as bike format to before nextRow
      set newRow to row before nextRow
    else
      delete targetRow
      import from "${escapedXml}" as bike format to end of rows of parentRow
      set newRow to last row of parentRow
    end if

    -- Move children back into new row
    repeat with childId in childIds
      move row id childId to end of rows of newRow
    end repeat

    return "OK"
  end tell
end tell
`;

    const result = runAppleScriptMultiline<string>(script);
    if (!result.success) {
      throw new Error(`Failed to update row ${update.row_id} with HTML: ${result.error}`);
    }
  }

  if (htmlUpdates.length > 0) {
    results.push(`${htmlUpdates.length} HTML`);
  }

  return `Updated ${updates.length} row(s) (${results.join(", ")})`;
}

/**
 * Deletes one or more rows from the document.
 */
export async function deleteRows(rowIds: string[]): Promise<string> {
  if (!isBikeRunning()) {
    throw new Error("Bike is not running. Please open Bike first.");
  }

  if (!hasOpenDocument()) {
    throw new Error("No document is open in Bike. Please open a document first.");
  }

  // Validate row IDs
  const validatedRowIds = validateRowIds(rowIds);

  const rowIdList = validatedRowIds.map(id => `"${id}"`).join(", ");

  const script = `
tell application "Bike"
  tell front document
    set rowsToDelete to {${rowIdList}}
    set deletedCount to 0
    repeat with rowId in rowsToDelete
      delete row id rowId
      set deletedCount to deletedCount + 1
    end repeat
    return "Deleted " & deletedCount & " row(s)"
  end tell
end tell
`;

  const result = runAppleScriptMultiline<string>(script);

  if (!result.success) {
    throw new Error(`Failed to delete rows: ${result.error}`);
  }

  if (!result.data) {
    throw new Error("No data returned from Bike");
  }

  return result.data;
}

/**
 * Queries rows using Bike's outline path syntax.
 */
export async function queryRows(outlinePath: string): Promise<string> {
  if (!isBikeRunning()) {
    throw new Error("Bike is not running. Please open Bike first.");
  }

  if (!hasOpenDocument()) {
    throw new Error("No document is open in Bike. Please open a document first.");
  }

  const escapedPath = escapeAppleScriptString(outlinePath);

  const script = `
tell application "Bike"
  set queryResult to query front document outline path "${escapedPath}"

  if class of queryResult is list then
    if (count of queryResult) is 0 then
      return "No rows found"
    end if

    set outputText to ""
    repeat with r in queryResult
      set rowId to id of r
      set rowName to name of r
      set outputText to outputText & "- " & rowName & " [row:" & rowId & "]" & linefeed
    end repeat
    return outputText
  else
    return queryResult as text
  end if
end tell
`;

  const result = runAppleScriptMultiline<string>(script);

  if (!result.success) {
    throw new Error(`Failed to query rows: ${result.error}`);
  }

  if (!result.data) {
    throw new Error("No data returned from Bike");
  }

  return result.data;
}
