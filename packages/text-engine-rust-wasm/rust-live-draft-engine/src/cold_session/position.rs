use super::model::{Run, Shard, Span};
#[derive(Clone, Copy, Default, Debug)]
pub(super) struct Delta {
    pub units: isize,
    pub bytes: isize,
}
impl Delta {
    pub fn plus(self, other: Self) -> Self {
        Self {
            units: self.units + other.units,
            bytes: self.bytes + other.bytes,
        }
    }
    pub fn inverse(self) -> Self {
        Self {
            units: -self.units,
            bytes: -self.bytes,
        }
    }
    pub fn unit(self, value: usize) -> usize {
        value
            .checked_add_signed(self.units)
            .expect("validated position")
    }
    pub fn byte(self, value: usize) -> usize {
        value
            .checked_add_signed(self.bytes)
            .expect("validated byte position")
    }
}
pub(super) trait Positioned: Clone {
    fn start(&self) -> usize;
    fn end(&self) -> usize;
    fn shifted(&self, delta: Delta) -> Self;
}
impl Positioned for Span {
    fn start(&self) -> usize {
        self.start_offset
    }
    fn end(&self) -> usize {
        self.end_offset
    }
    fn shifted(&self, d: Delta) -> Self {
        let mut v = self.clone();
        v.start_offset = d.unit(v.start_offset);
        v.end_offset = d.unit(v.end_offset);
        v
    }
}
impl Positioned for Run {
    fn start(&self) -> usize {
        self.start
    }
    fn end(&self) -> usize {
        self.end
    }
    fn shifted(&self, d: Delta) -> Self {
        let mut v = self.clone();
        v.start = d.unit(v.start);
        v.end = d.unit(v.end);
        v.start_byte = d.byte(v.start_byte);
        v.end_byte = d.byte(v.end_byte);
        v.key.provider_run_id = format!(
            "{}-{}-{}",
            v.key.script.to_ascii_lowercase(),
            v.start,
            v.end
        );
        v
    }
}
impl Positioned for Shard {
    fn start(&self) -> usize {
        self.start_offset
    }
    fn end(&self) -> usize {
        self.end_offset
    }
    fn shifted(&self, d: Delta) -> Self {
        let mut v = self.clone();
        v.start_offset = d.unit(v.start_offset);
        v.end_offset = d.unit(v.end_offset);
        for g in &mut v.glyphs {
            g.cluster = d.unit(g.cluster);
        }
        for p in &mut v.line_breaks {
            *p = d.unit(*p);
        }
        for p in &mut v.grapheme_boundaries {
            *p = d.unit(*p);
        }
        v
    }
}
