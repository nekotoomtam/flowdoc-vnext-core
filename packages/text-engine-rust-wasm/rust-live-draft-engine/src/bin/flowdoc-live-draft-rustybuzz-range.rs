use flowdoc_live_draft_text_engine::{
    flowdoc_text_engine_shape_range_json, FLOWDOC_RUSTYBUZZ_RANGE_NATIVE_SOURCE,
};
use std::env;
use std::fs;
use std::process;

fn fail(message: &str) -> ! {
    eprintln!("{message}");
    process::exit(1);
}

fn offset(value: &str, label: &str) -> usize {
    value
        .parse::<usize>()
        .unwrap_or_else(|_| fail(&format!("invalid {label}")))
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() != 8 {
        fail("usage: flowdoc-live-draft-rustybuzz-range <font-path> <text> <font-id> <range-start-byte> <range-end-byte> <context-start-byte> <context-end-byte>");
    }
    let font_path = &args[1];
    let font_data = fs::read(font_path)
        .unwrap_or_else(|error| fail(&format!("failed to read font file `{font_path}`: {error}")));
    let output = flowdoc_text_engine_shape_range_json(
        &font_data,
        &args[2],
        &args[3],
        font_path,
        FLOWDOC_RUSTYBUZZ_RANGE_NATIVE_SOURCE,
        offset(&args[4], "range start"),
        offset(&args[5], "range end"),
        offset(&args[6], "context start"),
        offset(&args[7], "context end"),
    )
    .unwrap_or_else(|message| fail(&message));
    println!("{output}");
}
