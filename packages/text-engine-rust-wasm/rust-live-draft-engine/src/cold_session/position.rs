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
    // One payload object plus the entries cloned in its owned vectors.
    fn copy_elements(&self) -> usize {
        1
    }
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
    fn copy_elements(&self) -> usize {
        // Membership is immutable and shared; cloning copies one Arc, not its entries.
        2 + self.key.features.len()
    }
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
    fn copy_elements(&self) -> usize {
        1 + self.glyphs.len()
            + self.line_breaks.len()
            + self.grapheme_boundaries.len()
            + self.concat_unsafe.len()
    }
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
