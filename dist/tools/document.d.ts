/**
 * Lists all open documents in Bike, marking the active one.
 */
export declare function listDocuments(): Promise<string>;
/**
 * Gets the outline of the current Bike document as human-readable indented text.
 */
export declare function getDocumentOutline(maxDepth?: number): Promise<string>;
/**
 * Creates a new Bike document.
 * If a name is provided, it becomes the first row (title) of the document.
 */
export declare function createDocument(name?: string): Promise<string>;
/**
 * Creates a new row in the current Bike document.
 */
export declare function createRow(name: string, parentId?: string, position?: "first" | "last" | "before" | "after", referenceId?: string): Promise<string>;
interface OutlineNode {
    name: string;
    children?: OutlineNode[];
}
/**
 * Creates a complete outline structure from a nested JSON structure.
 */
export declare function createOutline(structure: OutlineNode[], parentId?: string): Promise<string>;
/**
 * Groups multiple rows under a new or existing parent row.
 */
export declare function groupRows(rowIds: string[], groupName?: string, parentId?: string, position?: "first" | "last" | "before" | "after", referenceId?: string): Promise<string>;
/**
 * Updates an existing row's text content and/or type.
 */
export declare function updateRow(rowId: string, name?: string, type?: string): Promise<string>;
/**
 * Deletes one or more rows from the document.
 */
export declare function deleteRows(rowIds: string[]): Promise<string>;
export {};
