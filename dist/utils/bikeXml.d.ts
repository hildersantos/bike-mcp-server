import { OutlineNode } from "../schemas/document.js";
/**
 * Escapes HTML special characters for safe XML embedding.
 */
export declare function escapeHtml(text: string): string;
/**
 * Converts an OutlineNode to Bike XML <li> element.
 * @param node - The outline node to convert
 * @param allowHtml - If true, name is used as-is (may contain HTML); if false, HTML is escaped
 */
export declare function nodeToBikeXml(node: OutlineNode, allowHtml?: boolean): string;
/**
 * Wraps content in Bike XML document structure.
 */
export declare function wrapInBikeXml(content: string): string;
/**
 * Converts OutlineNode array to complete Bike XML document.
 * @param structure - Array of outline nodes
 * @param allowHtml - If true, node names may contain HTML formatting
 */
export declare function structureToBikeXml(structure: OutlineNode[], allowHtml?: boolean): string;
