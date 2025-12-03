import { runAppleScriptMultiline, isBikeRunning, hasOpenDocument } from "../services/applescript.js";
/**
 * Lists all open documents in Bike, marking the active one.
 */
export async function listDocuments() {
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
    const result = runAppleScriptMultiline(script);
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
export async function getDocumentOutline(maxDepth) {
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
    const result = runAppleScriptMultiline(script);
    if (!result.success) {
        throw new Error(`Failed to get document outline: ${result.error}`);
    }
    if (!result.data) {
        throw new Error("No data returned from Bike");
    }
    return result.data;
}
/**
 * Creates a new Bike document.
 * If a name is provided, it becomes the first row (title) of the document.
 */
export async function createDocument(name) {
    // Check if Bike is running
    if (!isBikeRunning()) {
        throw new Error("Bike is not running. Please open Bike first.");
    }
    const escapedName = name ? name.replace(/"/g, '\\"') : "";
    const script = `
tell application "Bike"
  set newDoc to make document
  set docId to id of root row of newDoc
  
  -- If name provided, create first row as title
  if "${escapedName}" is not "" then
    tell newDoc
      make row at front of rows of root row with properties {name:"${escapedName}"}
    end tell
  end if
  
  set docName to name of newDoc
  
  return docName & " (doc:" & docId & ")"
end tell
`;
    const result = runAppleScriptMultiline(script);
    if (!result.success) {
        throw new Error(`Failed to create document: ${result.error}`);
    }
    if (!result.data) {
        throw new Error("No data returned from Bike");
    }
    return result.data;
}
/**
 * Creates a new row in the current Bike document.
 */
export async function createRow(name, parentId, position = "last", referenceId) {
    // Check if Bike is running
    if (!isBikeRunning()) {
        throw new Error("Bike is not running. Please open Bike first.");
    }
    // Check if there's an open document
    if (!hasOpenDocument()) {
        throw new Error("No document is open in Bike. Please open a document first.");
    }
    const escapedName = name.replace(/"/g, '\\"');
    let script;
    if (position === "first") {
        const targetRow = parentId ? `row id "${parentId}"` : "root row";
        script = `
tell application "Bike"
  tell front document
    set newRow to make row at front of rows of ${targetRow} with properties {name:"${escapedName}"}
    set rowId to id of newRow
    set rowName to name of newRow
    return "Created: " & rowName & " [row:" & rowId & "]"
  end tell
end tell
`;
    }
    else if (position === "last") {
        const targetRow = parentId ? `row id "${parentId}"` : "root row";
        script = `
tell application "Bike"
  tell front document
    set newRow to make row at end of rows of ${targetRow} with properties {name:"${escapedName}"}
    set rowId to id of newRow
    set rowName to name of newRow
    return "Created: " & rowName & " [row:" & rowId & "]"
  end tell
end tell
`;
    }
    else if ((position === "before" || position === "after") && referenceId) {
        // For before/after, resolve the reference row within the parent's context
        const positionKeyword = position === "before" ? "before" : "after";
        script = `
tell application "Bike"
  tell front document
    set parentRow to container row of row id "${referenceId}"
    tell parentRow
      set newRow to make row at (${positionKeyword} row id "${referenceId}") with properties {name:"${escapedName}"}
    end tell
    set rowId to id of newRow
    set rowName to name of newRow
    return "Created: " & rowName & " [row:" & rowId & "]"
  end tell
end tell
`;
    }
    else {
        throw new Error("Invalid position or missing reference_id for before/after positioning");
    }
    const result = runAppleScriptMultiline(script);
    if (!result.success) {
        throw new Error(`Failed to create row: ${result.error}`);
    }
    if (!result.data) {
        throw new Error("No data returned from Bike");
    }
    return result.data;
}
/**
 * Creates a complete outline structure from a nested JSON structure.
 */
export async function createOutline(structure, parentId) {
    // Check if Bike is running
    if (!isBikeRunning()) {
        throw new Error("Bike is not running. Please open Bike first.");
    }
    // Check if there's an open document
    if (!hasOpenDocument()) {
        throw new Error("No document is open in Bike. Please open a document first.");
    }
    // Build AppleScript handler to recursively create rows
    const targetRow = parentId ? `row id "${parentId}"` : "root row";
    // Convert structure to AppleScript list format
    function nodeToAppleScript(node) {
        const escapedName = node.name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        if (node.children && node.children.length > 0) {
            const childrenScript = node.children.map(nodeToAppleScript).join(", ");
            return `{theName:"${escapedName}", theChildren:{${childrenScript}}}`;
        }
        return `{theName:"${escapedName}", theChildren:{}}`;
    }
    const structureScript = structure.map(nodeToAppleScript).join(", ");
    const script = `
on createRows(nodeList, parentRow)
  tell application "Bike"
    tell front document
      set createdIds to {}
      repeat with node in nodeList
        set newRow to make row at end of rows of parentRow with properties {name:theName of node}
        set end of createdIds to id of newRow
        set childNodes to theChildren of node
        if (count of childNodes) > 0 then
          my createRows(childNodes, newRow)
        end if
      end repeat
      return createdIds
    end tell
  end tell
end createRows

tell application "Bike"
  tell front document
    set targetRow to ${targetRow}
    set nodeList to {${structureScript}}
    set createdIds to my createRows(nodeList, targetRow)
    return "Created " & (count of createdIds) & " top-level rows"
  end tell
end tell
`;
    const result = runAppleScriptMultiline(script);
    if (!result.success) {
        throw new Error(`Failed to create outline: ${result.error}`);
    }
    if (!result.data) {
        throw new Error("No data returned from Bike");
    }
    return result.data;
}
/**
 * Groups multiple rows under a new or existing parent row.
 */
export async function groupRows(rowIds, groupName, parentId, position = "last", referenceId) {
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
    // Build the list of row IDs for AppleScript
    const rowIdList = rowIds.map(id => `"${id}"`).join(", ");
    let script;
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
    }
    else {
        // Create new group and move rows into it
        const escapedName = groupName.replace(/"/g, '\\"');
        // Determine where to create the new group based on position
        let createGroupScript;
        if (position === "before" && referenceId) {
            createGroupScript = `
    set parentRow to container row of row id "${referenceId}"
    tell parentRow
      set newGroup to make row at (before row id "${referenceId}") with properties {name:"${escapedName}"}
    end tell`;
        }
        else if (position === "after" && referenceId) {
            createGroupScript = `
    set parentRow to container row of row id "${referenceId}"
    tell parentRow
      set newGroup to make row at (after row id "${referenceId}") with properties {name:"${escapedName}"}
    end tell`;
        }
        else if (position === "first") {
            createGroupScript = `
    set newGroup to make row at front of rows of root row with properties {name:"${escapedName}"}`;
        }
        else {
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
    const result = runAppleScriptMultiline(script);
    if (!result.success) {
        throw new Error(`Failed to group rows: ${result.error}`);
    }
    if (!result.data) {
        throw new Error("No data returned from Bike");
    }
    return result.data;
}
/**
 * Updates an existing row's text content and/or type.
 */
export async function updateRow(rowId, name, type) {
    if (!isBikeRunning()) {
        throw new Error("Bike is not running. Please open Bike first.");
    }
    if (!hasOpenDocument()) {
        throw new Error("No document is open in Bike. Please open a document first.");
    }
    if (!name && !type) {
        throw new Error("At least one of 'name' or 'type' must be provided");
    }
    const updates = [];
    if (name !== undefined) {
        const escapedName = name.replace(/"/g, '\\"');
        updates.push(`set name of targetRow to "${escapedName}"`);
    }
    if (type !== undefined) {
        updates.push(`set type of targetRow to ${type}`);
    }
    const script = `
tell application "Bike"
  tell front document
    set targetRow to row id "${rowId}"
    ${updates.join("\n    ")}
    set rowName to name of targetRow
    set rowType to type of targetRow as text
    return "Updated: " & rowName & " [row:${rowId}] (type: " & rowType & ")"
  end tell
end tell
`;
    const result = runAppleScriptMultiline(script);
    if (!result.success) {
        throw new Error(`Failed to update row: ${result.error}`);
    }
    if (!result.data) {
        throw new Error("No data returned from Bike");
    }
    return result.data;
}
/**
 * Deletes one or more rows from the document.
 */
export async function deleteRows(rowIds) {
    if (!isBikeRunning()) {
        throw new Error("Bike is not running. Please open Bike first.");
    }
    if (!hasOpenDocument()) {
        throw new Error("No document is open in Bike. Please open a document first.");
    }
    const rowIdList = rowIds.map(id => `"${id}"`).join(", ");
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
    const result = runAppleScriptMultiline(script);
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
export async function queryRows(outlinePath) {
    if (!isBikeRunning()) {
        throw new Error("Bike is not running. Please open Bike first.");
    }
    if (!hasOpenDocument()) {
        throw new Error("No document is open in Bike. Please open a document first.");
    }
    const escapedPath = outlinePath.replace(/"/g, '\\"');
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
    const result = runAppleScriptMultiline(script);
    if (!result.success) {
        throw new Error(`Failed to query rows: ${result.error}`);
    }
    if (!result.data) {
        throw new Error("No data returned from Bike");
    }
    return result.data;
}
