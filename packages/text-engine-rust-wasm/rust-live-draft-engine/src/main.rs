use flowdoc_live_draft_text_engine::{
    flowdoc_text_engine_shape_json, FLOWDOC_RUSTYBUZZ_NATIVE_SOURCE,
};
use std::env;
use std::fs;
use std::process;

fn fail(message: &str) -> ! {
    eprintln!("{message}");
    process::exit(1);
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() != 4 {
        fail("usage: flowdoc-live-draft-rustybuzz <font-path> <text> <font-id>");
    }
    let font_path = &args[1];
    let text = &args[2];
    let font_id = &args[3];
    let font_data = fs::read(font_path)
        .unwrap_or_else(|error| fail(&format!("failed to read font file `{font_path}`: {error}")));
    let output = flowdoc_text_engine_shape_json(
        &font_data,
        text,
        font_id,
        font_path,
        FLOWDOC_RUSTYBUZZ_NATIVE_SOURCE,
    )
    .unwrap_or_else(|message| fail(&message));
    println!("{output}");
}
