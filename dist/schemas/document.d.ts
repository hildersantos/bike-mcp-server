import { z } from "zod";
export declare const RowTypeEnum: z.ZodEnum<["body", "heading", "quote", "blockquote", "code", "note", "unordered", "ordered", "task", "hr"]>;
export declare const ListDocumentsInputSchema: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
export type ListDocumentsInput = z.infer<typeof ListDocumentsInputSchema>;
export declare const GetDocumentOutlineInputSchema: z.ZodObject<{
    max_depth: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    max_depth?: number | undefined;
}, {
    max_depth?: number | undefined;
}>;
export type GetDocumentOutlineInput = z.infer<typeof GetDocumentOutlineInputSchema>;
export declare const CreateDocumentInputSchema: z.ZodObject<{
    structure: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodOptional<z.ZodEnum<["body", "heading", "quote", "blockquote", "code", "note", "unordered", "ordered", "task", "hr"]>>;
        children: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        type?: "body" | "heading" | "quote" | "blockquote" | "code" | "note" | "unordered" | "ordered" | "task" | "hr" | undefined;
        children?: any[] | undefined;
    }, {
        name: string;
        type?: "body" | "heading" | "quote" | "blockquote" | "code" | "note" | "unordered" | "ordered" | "task" | "hr" | undefined;
        children?: any[] | undefined;
    }>, "many">>;
    html: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strict", z.ZodTypeAny, {
    html: boolean;
    structure?: {
        name: string;
        type?: "body" | "heading" | "quote" | "blockquote" | "code" | "note" | "unordered" | "ordered" | "task" | "hr" | undefined;
        children?: any[] | undefined;
    }[] | undefined;
}, {
    structure?: {
        name: string;
        type?: "body" | "heading" | "quote" | "blockquote" | "code" | "note" | "unordered" | "ordered" | "task" | "hr" | undefined;
        children?: any[] | undefined;
    }[] | undefined;
    html?: boolean | undefined;
}>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentInputSchema>;
export interface OutlineNode {
    name: string;
    type?: string;
    children?: OutlineNode[];
}
export declare const CreateRowsInputSchema: z.ZodObject<{
    structure: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodOptional<z.ZodEnum<["body", "heading", "quote", "blockquote", "code", "note", "unordered", "ordered", "task", "hr"]>>;
        children: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        type?: "body" | "heading" | "quote" | "blockquote" | "code" | "note" | "unordered" | "ordered" | "task" | "hr" | undefined;
        children?: any[] | undefined;
    }, {
        name: string;
        type?: "body" | "heading" | "quote" | "blockquote" | "code" | "note" | "unordered" | "ordered" | "task" | "hr" | undefined;
        children?: any[] | undefined;
    }>, "many">;
    parent_id: z.ZodOptional<z.ZodString>;
    position: z.ZodDefault<z.ZodEnum<["first", "last", "before", "after"]>>;
    reference_id: z.ZodOptional<z.ZodString>;
    html: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strict", z.ZodTypeAny, {
    structure: {
        name: string;
        type?: "body" | "heading" | "quote" | "blockquote" | "code" | "note" | "unordered" | "ordered" | "task" | "hr" | undefined;
        children?: any[] | undefined;
    }[];
    html: boolean;
    position: "first" | "last" | "before" | "after";
    parent_id?: string | undefined;
    reference_id?: string | undefined;
}, {
    structure: {
        name: string;
        type?: "body" | "heading" | "quote" | "blockquote" | "code" | "note" | "unordered" | "ordered" | "task" | "hr" | undefined;
        children?: any[] | undefined;
    }[];
    html?: boolean | undefined;
    parent_id?: string | undefined;
    position?: "first" | "last" | "before" | "after" | undefined;
    reference_id?: string | undefined;
}>;
export type CreateRowsInput = z.infer<typeof CreateRowsInputSchema>;
export declare const GroupRowsInputSchema: z.ZodObject<{
    row_ids: z.ZodArray<z.ZodString, "many">;
    group_name: z.ZodOptional<z.ZodString>;
    parent_id: z.ZodOptional<z.ZodString>;
    position: z.ZodDefault<z.ZodEnum<["first", "last", "before", "after"]>>;
    reference_id: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    position: "first" | "last" | "before" | "after";
    row_ids: string[];
    parent_id?: string | undefined;
    reference_id?: string | undefined;
    group_name?: string | undefined;
}, {
    row_ids: string[];
    parent_id?: string | undefined;
    position?: "first" | "last" | "before" | "after" | undefined;
    reference_id?: string | undefined;
    group_name?: string | undefined;
}>;
export type GroupRowsInput = z.infer<typeof GroupRowsInputSchema>;
export declare const UpdateRowInputSchema: z.ZodObject<{
    updates: z.ZodArray<z.ZodObject<{
        row_id: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<["body", "heading", "quote", "blockquote", "code", "note", "unordered", "ordered", "task", "hr"]>>;
        html: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        html: boolean;
        row_id: string;
        type?: "body" | "heading" | "quote" | "blockquote" | "code" | "note" | "unordered" | "ordered" | "task" | "hr" | undefined;
        name?: string | undefined;
    }, {
        row_id: string;
        type?: "body" | "heading" | "quote" | "blockquote" | "code" | "note" | "unordered" | "ordered" | "task" | "hr" | undefined;
        name?: string | undefined;
        html?: boolean | undefined;
    }>, "many">;
}, "strict", z.ZodTypeAny, {
    updates: {
        html: boolean;
        row_id: string;
        type?: "body" | "heading" | "quote" | "blockquote" | "code" | "note" | "unordered" | "ordered" | "task" | "hr" | undefined;
        name?: string | undefined;
    }[];
}, {
    updates: {
        row_id: string;
        type?: "body" | "heading" | "quote" | "blockquote" | "code" | "note" | "unordered" | "ordered" | "task" | "hr" | undefined;
        name?: string | undefined;
        html?: boolean | undefined;
    }[];
}>;
export type UpdateRowInput = z.infer<typeof UpdateRowInputSchema>;
export declare const DeleteRowInputSchema: z.ZodObject<{
    row_ids: z.ZodArray<z.ZodString, "many">;
}, "strict", z.ZodTypeAny, {
    row_ids: string[];
}, {
    row_ids: string[];
}>;
export type DeleteRowInput = z.infer<typeof DeleteRowInputSchema>;
export declare const QueryRowsInputSchema: z.ZodObject<{
    outline_path: z.ZodString;
}, "strict", z.ZodTypeAny, {
    outline_path: string;
}, {
    outline_path: string;
}>;
export type QueryRowsInput = z.infer<typeof QueryRowsInputSchema>;
