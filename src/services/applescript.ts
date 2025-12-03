import { execSync } from "child_process";

export interface AppleScriptResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Executes an AppleScript and returns the result.
 * The script should return a JSON string for structured data.
 */
export function runAppleScript<T = unknown>(script: string): AppleScriptResult<T> {
  try {
    // Escape the script for shell execution
    const escapedScript = script.replace(/'/g, "'\\''");
    
    const result = execSync(`osascript -e '${escapedScript}'`, {
      encoding: "utf-8",
      timeout: 30000, // 30 second timeout
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outlines
    });

    const trimmed = result.trim();
    
    // Try to parse as JSON if it looks like JSON
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed) as T;
        return { success: true, data: parsed };
      } catch {
        // Not valid JSON, return as string
        return { success: true, data: trimmed as T };
      }
    }

    return { success: true, data: trimmed as T };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Executes a multi-line AppleScript using a temporary approach
 * that handles complex scripts better than single-line escaping.
 */
export function runAppleScriptMultiline<T = unknown>(script: string): AppleScriptResult<T> {
  try {
    // For multi-line scripts, we use -e for each line
    const lines = script.split("\n").filter(line => line.trim() !== "");
    const args = lines.map(line => `-e '${line.replace(/'/g, "'\\''")}'`).join(" ");
    
    const result = execSync(`osascript ${args}`, {
      encoding: "utf-8",
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
    });

    const trimmed = result.trim();
    
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed) as T;
        return { success: true, data: parsed };
      } catch {
        return { success: true, data: trimmed as T };
      }
    }

    return { success: true, data: trimmed as T };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Checks if Bike app is running
 */
export function isBikeRunning(): boolean {
  const script = `
tell application "System Events"
  return exists (processes where name is "Bike")
end tell
`;
  const result = runAppleScriptMultiline<string>(script);
  return result.success && result.data === "true";
}

/**
 * Checks if Bike has a document open
 */
export function hasOpenDocument(): boolean {
  const script = `
tell application "Bike"
  return (count of documents) > 0
end tell
`;
  const result = runAppleScriptMultiline<string>(script);
  return result.success && result.data === "true";
}
