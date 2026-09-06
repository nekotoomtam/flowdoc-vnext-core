//! Offline extraction only. Uses the existing locked parser; never rebuilds MR1.
use rustybuzz::ttf_parser::{Face, GlyphId, OutlineBuilder};
use std::{env, fs};

#[derive(Default)]
struct Path(Vec<String>);
impl Path {
    fn command(&mut self, op: &str, values: &[f32]) {
        assert!(values.iter().all(|v| v.is_finite()));
        let coordinates = values.iter().map(|v| format!(",{}", if *v == 0.0 { 0.0 } else { *v })).collect::<String>();
        self.0.push(format!("[\"{op}\"{coordinates}]"));
    }
}
impl OutlineBuilder for Path {
    fn move_to(&mut self, x: f32, y: f32) { self.command("M", &[x, y]); }
    fn line_to(&mut self, x: f32, y: f32) { self.command("L", &[x, y]); }
    fn quad_to(&mut self, x1: f32, y1: f32, x: f32, y: f32) { self.command("Q", &[x1, y1, x, y]); }
    fn curve_to(&mut self, x1: f32, y1: f32, x2: f32, y2: f32, x: f32, y: f32) { self.command("C", &[x1, y1, x2, y2, x, y]); }
    fn close(&mut self) { self.command("Z", &[]); }
}
fn main() {
    let args: Vec<String> = env::args().collect();
    assert_eq!(args.len(), 2, "usage: flowdoc-creator-outlines <font>");
    let bytes = fs::read(&args[1]).expect("font bytes");
    let face = Face::parse(&bytes, 0).expect("font face");
    let mut glyphs = Vec::new();
    for id in 0..face.number_of_glyphs() {
        let mut path = Path::default();
        let bounds = face.outline_glyph(GlyphId(id), &mut path);
        assert!(bounds.is_some() || path.0.is_empty(), "partial outline {id}");
        glyphs.push(format!("[{}]", path.0.join(",")));
    }
    println!("{{\"unitsPerEm\":{},\"glyphs\":[{}]}}", face.units_per_em(), glyphs.join(","));
}
