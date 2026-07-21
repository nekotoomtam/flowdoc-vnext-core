use flowdoc_live_draft_text_engine::{
    flowdoc_text_engine_segment_range_json, FLOWDOC_ICU4X_RANGE_NATIVE_SOURCE,
};
use std::env;
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
    if args.len() != 6 {
        fail("usage: flowdoc-live-draft-icu4x-range <text> <target-start-byte> <target-end-byte> <context-start-byte> <context-end-byte>");
    }
    let output = flowdoc_text_engine_segment_range_json(
        &args[1],
        FLOWDOC_ICU4X_RANGE_NATIVE_SOURCE,
        offset(&args[2], "target start"),
        offset(&args[3], "target end"),
        offset(&args[4], "context start"),
        offset(&args[5], "context end"),
    )
    .unwrap_or_else(|message| fail(&message));
    println!("{output}");
}
