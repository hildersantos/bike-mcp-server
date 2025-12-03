export interface AppleScriptResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}
/**
 * Executes an AppleScript and returns the result.
 * The script should return a JSON string for structured data.
 */
export declare function runAppleScript<T = unknown>(script: string): AppleScriptResult<T>;
/**
 * Executes a multi-line AppleScript using a temporary approach
 * that handles complex scripts better than single-line escaping.
 */
export declare function runAppleScriptMultiline<T = unknown>(script: string): AppleScriptResult<T>;
/**
 * Checks if Bike app is running
 */
export declare function isBikeRunning(): boolean;
/**
 * Checks if Bike has a document open
 */
export declare function hasOpenDocument(): boolean;
