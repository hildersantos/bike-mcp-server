import { z } from "zod";

// Schema for list_documents input (no parameters)
export const ListDocumentsInputSchema = z.object({}).strict();

export type ListDocumentsInput = z.infer<typeof ListDocumentsInputSchema>;

// Schema for get_document_outline input
export const GetDocumentOutlineInputSchema = z.object({
  max_depth: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Maximum depth of the outline tree to return. If not specified, returns the full tree."),
}).strict();

export type GetDocumentOutlineInput = z.infer<typeof GetDocumentOutlineInputSchema>;

// Schema for create_document input
export const CreateDocumentInputSchema = z.object({
  name: z
    .string()
    .optional()
    .describe("Title for the document. Creates a first row with this text. If not provided, creates an empty document."),
}).strict();

export type CreateDocumentInput = z.infer<typeof CreateDocumentInputSchema>;

// Schema for create_row input
// Note: validation for reference_id requirement is done at runtime
export const CreateRowInputSchema = z.object({
  name: z
    .string()
    .describe("Text content for the new row."),
  parent_id: z
    .string()
    .optional()
    .describe("ID of the parent row. If not provided, adds to the root level."),
  position: z
    .enum(["first", "last", "before", "after"])
    .default("last")
    .describe("Where to insert the row: 'first' or 'last' child of parent, or 'before'/'after' the reference_id row."),
  reference_id: z
    .string()
    .optional()
    .describe("Required when position is 'before' or 'after'. The ID of the sibling row to position relative to."),
}).strict();

export type CreateRowInput = z.infer<typeof CreateRowInputSchema>;

// Type for outline structure (used at runtime)
export interface OutlineNode {
  name: string;
  children?: OutlineNode[];
}

// Schema for create_outline input
// Using z.any() for children since recursive schemas don't serialize to JSON Schema
// Runtime validation happens in the tool implementation
export const CreateOutlineInputSchema = z.object({
  structure: z
    .array(z.object({
      name: z.string().describe("Text content for the row"),
      children: z.array(z.any()).optional().describe("Child rows (same structure, nested)"),
    }))
    .describe("Array of outline nodes to create. Each node has a 'name' and optional 'children' array."),
  parent_id: z
    .string()
    .optional()
    .describe("ID of the parent row to add the outline under. If not provided, adds to root level."),
}).strict();

export type CreateOutlineInput = z.infer<typeof CreateOutlineInputSchema>;

// Schema for group_rows input
// Note: validation for group_name/parent_id requirement is done at runtime
export const GroupRowsInputSchema = z.object({
  row_ids: z
    .array(z.string())
    .min(1)
    .describe("Array of row IDs to group together."),
  group_name: z
    .string()
    .optional()
    .describe("Name for the new group row. Required if parent_id is not provided."),
  parent_id: z
    .string()
    .optional()
    .describe("ID of an existing row to move the rows into. If not provided, a new group row is created."),
  position: z
    .enum(["first", "last", "before", "after"])
    .default("last")
    .describe("Where to place the new group row. Default: in-place (before the first row being grouped). Use 'first'/'last' for root level, or 'before'/'after' with reference_id."),
  reference_id: z
    .string()
    .optional()
    .describe("Required when position is 'before' or 'after'."),
}).strict();

export type GroupRowsInput = z.infer<typeof GroupRowsInputSchema>;
