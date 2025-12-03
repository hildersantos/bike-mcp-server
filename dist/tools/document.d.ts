import { OutlineNode } from "../schemas/document.js";
/**
 * Lists all open documents in Bike, marking the active one.
 */
export declare function listDocuments(): Promise<string>;
/**
 * Gets the outline of the current Bike document as human-readable indented text.
 */
export declare function getDocumentOutline(maxDepth?: number): Promise<string>;
/**
 * Creates a new Bike document, optionally populated with an outline structure.
 */
export declare function createDocument(structure?: OutlineNode[], html?: boolean): Promise<string>;
/**
 * Creates one or more rows with optional nested structure.
 * Supports positioning via position and reference_id.
 */
export declare function createRows(structure: OutlineNode[], parentId?: string, position?: "first" | "last" | "before" | "after", referenceId?: string, html?: boolean): Promise<string>;
/**
 * Groups multiple rows under a new or existing parent row.
 */
export declare function groupRows(rowIds: string[], groupName?: string, parentId?: string, position?: "first" | "last" | "before" | "after", referenceId?: string): Promise<string>;
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
export declare function updateRows(updates: RowUpdate[]): Promise<string>;
/**
 * Deletes one or more rows from the document.
 */
export declare function deleteRows(rowIds: string[]): Promise<string>;
/**
 * Queries rows using Bike's outline path syntax.
 */
export declare function queryRows(outlinePath: string): Promise<string>;
export {};
