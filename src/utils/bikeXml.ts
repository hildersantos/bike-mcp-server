import { OutlineNode } from "../schemas/document.js";

/**
 * Escapes HTML special characters for safe XML embedding.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Converts an OutlineNode to Bike XML <li> element.
 * @param node - The outline node to convert
 * @param allowHtml - If true, name is used as-is (may contain HTML); if false, HTML is escaped
 */
export function nodeToBikeXml(node: OutlineNode, allowHtml = false): string {
  // Normalize blockquote to quote
  const nodeType = node.type === "blockquote" ? "quote" : node.type;
  const typeAttr = nodeType && nodeType !== "body"
    ? ` data-type="${nodeType}"`
    : "";

  // If allowHtml, use name directly; otherwise escape HTML characters
  const content = allowHtml ? node.name : escapeHtml(node.name);

  const childrenXml = node.children
    ?.map(child => nodeToBikeXml(child, allowHtml))
    .join("\n") || "";

  const childrenWrapper = childrenXml ? `<ul>\n${childrenXml}\n</ul>` : "";

  return `<li${typeAttr}><p>${content}</p>${childrenWrapper}</li>`;
}

/**
 * Wraps content in Bike XML document structure.
 */
export function wrapInBikeXml(content: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<html>
<body>
<ul>
${content}
</ul>
</body>
</html>`;
}

/**
 * Converts OutlineNode array to complete Bike XML document.
 * @param structure - Array of outline nodes
 * @param allowHtml - If true, node names may contain HTML formatting
 */
export function structureToBikeXml(structure: OutlineNode[], allowHtml = false): string {
  const items = structure.map(node => nodeToBikeXml(node, allowHtml)).join("\n");
  return wrapInBikeXml(items);
}
