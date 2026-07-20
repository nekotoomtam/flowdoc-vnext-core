use flowdoc_live_draft_text_engine::{
    flowdoc_text_engine_segment_json, FLOWDOC_ICU4X_NATIVE_SOURCE,
};
use std::env;
use std::process;

fn fail(message: &str) -> ! {
    eprintln!("{message}");
    process::exit(1);
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() != 2 {
        fail("usage: flowdoc-live-draft-icu4x <text>");
    }
    let output = flowdoc_text_engine_segment_json(&args[1], FLOWDOC_ICU4X_NATIVE_SOURCE)
        .unwrap_or_else(|message| fail(&message));
    println!("{output}");
}
