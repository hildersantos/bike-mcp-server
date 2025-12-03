import { z } from "zod";

// Size limits for input validation
const MAX_ROW_NAME_LENGTH = 10000;
const MAX_ROW_ID_LENGTH = 100;
const MAX_GROUP_NAME_LENGTH = 500;
const MAX_OUTLINE_PATH_LENGTH = 1000;

// Row types supported by Bike
// Note: 'blockquote' is an alias for 'quote' (Bike uses different names in different contexts)
export const RowTypeEnum = z.enum([
  "body",
  "heading",
  "quote",
  "blockquote", // alias for quote
  "code",
  "note",
  "unordered",
  "ordered",
  "task",
  "hr",
]);

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
  structure: z
    .array(z.object({
      name: z.string().max(MAX_ROW_NAME_LENGTH).describe("Text content for the row"),
      type: RowTypeEnum.optional().describe("Row type (body, heading, task, etc.)"),
      children: z.array(z.any()).optional().describe("Child rows (nested)"),
    }))
    .optional()
    .describe("Outline structure to populate the document. Same format as bike_create_rows."),
}).strict();

export type CreateDocumentInput = z.infer<typeof CreateDocumentInputSchema>;

// Type for outline structure (used at runtime)
export interface OutlineNode {
  name: string;
  type?: string;
  children?: OutlineNode[];
}

// Schema for create_rows input
// Using z.any() for children since recursive schemas don't serialize to JSON Schema
// Runtime validation happens in the tool implementation
export const CreateRowsInputSchema = z.object({
  structure: z
    .array(z.object({
      name: z.string().max(MAX_ROW_NAME_LENGTH).describe("Text content for the row"),
      type: RowTypeEnum.optional().describe("Row type (body, heading, task, etc.)"),
      children: z.array(z.any()).optional().describe("Child rows (same structure, nested)"),
    }))
    .min(1)
    .describe("Array of rows to create. Each can have name, type, and children."),
  parent_id: z
    .string()
    .max(MAX_ROW_ID_LENGTH)
    .optional()
    .describe("ID of the parent row. If not provided, adds to root level."),
  position: z
    .enum(["first", "last", "before", "after"])
    .default("last")
    .describe("Where to insert: 'first'/'last' child of parent, or 'before'/'after' reference_id."),
  reference_id: z
    .string()
    .max(MAX_ROW_ID_LENGTH)
    .optional()
    .describe("Required when position is 'before' or 'after'."),
}).strict();

export type CreateRowsInput = z.infer<typeof CreateRowsInputSchema>;

// Schema for group_rows input
// Note: validation for group_name/parent_id requirement is done at runtime
export const GroupRowsInputSchema = z.object({
  row_ids: z
    .array(z.string().max(MAX_ROW_ID_LENGTH))
    .min(1)
    .describe("Array of row IDs to group together."),
  group_name: z
    .string()
    .max(MAX_GROUP_NAME_LENGTH)
    .optional()
    .describe("Name for the new group row. Required if parent_id is not provided."),
  parent_id: z
    .string()
    .max(MAX_ROW_ID_LENGTH)
    .optional()
    .describe("ID of an existing row to move the rows into. If not provided, a new group row is created."),
  position: z
    .enum(["first", "last", "before", "after"])
    .default("last")
    .describe("Where to place the new group row. Default: in-place (before the first row being grouped). Use 'first'/'last' for root level, or 'before'/'after' with reference_id."),
  reference_id: z
    .string()
    .max(MAX_ROW_ID_LENGTH)
    .optional()
    .describe("Required when position is 'before' or 'after'."),
}).strict();

export type GroupRowsInput = z.infer<typeof GroupRowsInputSchema>;

// Schema for update_row input (batch)
export const UpdateRowInputSchema = z.object({
  updates: z
    .array(z.object({
      row_id: z.string().max(MAX_ROW_ID_LENGTH).describe("ID of the row to update"),
      name: z.string().max(MAX_ROW_NAME_LENGTH).optional().describe("New text content"),
      type: RowTypeEnum.optional().describe("New row type"),
    }))
    .min(1)
    .describe("Array of row updates. Each update has row_id (required), name (optional), and type (optional)."),
}).strict();

export type UpdateRowInput = z.infer<typeof UpdateRowInputSchema>;

// Schema for delete_row input
export const DeleteRowInputSchema = z.object({
  row_ids: z
    .array(z.string().max(MAX_ROW_ID_LENGTH))
    .min(1)
    .describe("Array of row IDs to delete. Children will also be deleted."),
}).strict();

export type DeleteRowInput = z.infer<typeof DeleteRowInputSchema>;

// Schema for query_rows input
export const QueryRowsInputSchema = z.object({
  outline_path: z
    .string()
    .max(MAX_OUTLINE_PATH_LENGTH)
    .describe("Outline path query (e.g., '//task', '//@done', '//heading')."),
}).strict();

export type QueryRowsInput = z.infer<typeof QueryRowsInputSchema>;
