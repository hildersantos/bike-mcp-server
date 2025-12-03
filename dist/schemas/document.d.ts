import { z } from "zod";
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
    name: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    name?: string | undefined;
}, {
    name?: string | undefined;
}>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentInputSchema>;
export declare const CreateRowInputSchema: z.ZodObject<{
    name: z.ZodString;
    parent_id: z.ZodOptional<z.ZodString>;
    position: z.ZodDefault<z.ZodEnum<["first", "last", "before", "after"]>>;
    reference_id: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    name: string;
    position: "first" | "last" | "before" | "after";
    parent_id?: string | undefined;
    reference_id?: string | undefined;
}, {
    name: string;
    parent_id?: string | undefined;
    position?: "first" | "last" | "before" | "after" | undefined;
    reference_id?: string | undefined;
}>;
export type CreateRowInput = z.infer<typeof CreateRowInputSchema>;
export interface OutlineNode {
    name: string;
    children?: OutlineNode[];
}
export declare const CreateOutlineInputSchema: z.ZodObject<{
    structure: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        children: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        children?: any[] | undefined;
    }, {
        name: string;
        children?: any[] | undefined;
    }>, "many">;
    parent_id: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    structure: {
        name: string;
        children?: any[] | undefined;
    }[];
    parent_id?: string | undefined;
}, {
    structure: {
        name: string;
        children?: any[] | undefined;
    }[];
    parent_id?: string | undefined;
}>;
export type CreateOutlineInput = z.infer<typeof CreateOutlineInputSchema>;
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
export declare const RowTypeEnum: z.ZodEnum<["body", "heading", "quote", "code", "note", "unordered", "ordered", "task", "hr"]>;
export declare const UpdateRowInputSchema: z.ZodObject<{
    row_id: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["body", "heading", "quote", "code", "note", "unordered", "ordered", "task", "hr"]>>;
}, "strict", z.ZodTypeAny, {
    row_id: string;
    type?: "code" | "body" | "heading" | "quote" | "note" | "unordered" | "ordered" | "task" | "hr" | undefined;
    name?: string | undefined;
}, {
    row_id: string;
    type?: "code" | "body" | "heading" | "quote" | "note" | "unordered" | "ordered" | "task" | "hr" | undefined;
    name?: string | undefined;
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
