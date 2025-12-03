/**
 * Escapes a string for safe use in AppleScript string literals.
 * Handles: backslashes, double quotes, carriage returns, newlines
 */
export declare function escapeAppleScriptString(value: string): string;
export declare function validateRowId(id: string): string;
/**
 * Validates an array of row IDs.
 */
export declare function validateRowIds(ids: string[]): string[];
