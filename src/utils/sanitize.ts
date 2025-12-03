/**
 * Escapes a string for safe use in AppleScript string literals.
 * Handles: backslashes, double quotes, carriage returns, newlines
 */
export function escapeAppleScriptString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
}

/**
 * Validates that a row ID matches Bike's expected format.
 * Bike row IDs are alphanumeric with possible hyphens/underscores.
 */
const ROW_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export function validateRowId(id: string): string {
  if (!ROW_ID_PATTERN.test(id)) {
    throw new Error(`Invalid row ID format: "${id}". IDs must be alphanumeric with hyphens/underscores only.`);
  }
  return id;
}

/**
 * Validates an array of row IDs.
 */
export function validateRowIds(ids: string[]): string[] {
  return ids.map(validateRowId);
}
