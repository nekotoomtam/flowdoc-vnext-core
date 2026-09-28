/* tslint:disable */
/* eslint-disable */

export function flowdoc_text_engine_mr1_range_wasm_boundary_version(): string;

export function flowdoc_text_engine_mr1_wasm_boundary_version(): string;

export function flowdoc_text_engine_wasm_boundary_version(): string;

export function flowdoc_text_engine_wasm_readiness_marker(): number;

export function flowdoc_text_engine_wasm_segment_json(text: string): string;

export function flowdoc_text_engine_wasm_segment_range_json(text: string, target_start_byte: number, target_end_byte: number, context_start_byte: number, context_end_byte: number): string;

export function flowdoc_text_engine_wasm_shape_json(font_data: Uint8Array, text: string, font_id: string): string;

export function flowdoc_text_engine_wasm_shape_range_json(font_data: Uint8Array, text: string, font_id: string, range_start_byte: number, range_end_byte: number, context_start_byte: number, context_end_byte: number): string;

export function product_session_apply(raw: string): string;

export function product_session_branch(receipt: string, revision: bigint): string;

export function product_session_create(raw: string): string;

export function product_session_dispose(receipt: string): string;

export function product_session_enter(raw: string): string;

export function product_session_inverse_join(raw: string): string;

export function product_session_project(receipt: string, revision: bigint): string;

export function product_session_segment(receipt: string, revision: bigint, text: string): string;

export function product_session_shape(receipt: string, revision: bigint, text: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly product_session_apply: (a: number, b: number) => [number, number];
    readonly product_session_branch: (a: number, b: number, c: bigint) => [number, number];
    readonly product_session_create: (a: number, b: number) => [number, number];
    readonly product_session_dispose: (a: number, b: number) => [number, number];
    readonly product_session_enter: (a: number, b: number) => [number, number];
    readonly product_session_inverse_join: (a: number, b: number) => [number, number];
    readonly product_session_project: (a: number, b: number, c: bigint) => [number, number];
    readonly product_session_segment: (a: number, b: number, c: bigint, d: number, e: number) => [number, number];
    readonly product_session_shape: (a: number, b: number, c: bigint, d: number, e: number) => [number, number];
    readonly flowdoc_text_engine_mr1_range_wasm_boundary_version: () => [number, number];
    readonly flowdoc_text_engine_mr1_wasm_boundary_version: () => [number, number];
    readonly flowdoc_text_engine_wasm_boundary_version: () => [number, number];
    readonly flowdoc_text_engine_wasm_readiness_marker: () => number;
    readonly flowdoc_text_engine_wasm_segment_json: (a: number, b: number) => [number, number, number, number];
    readonly flowdoc_text_engine_wasm_segment_range_json: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly flowdoc_text_engine_wasm_shape_json: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly flowdoc_text_engine_wasm_shape_range_json: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number, number, number];
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
