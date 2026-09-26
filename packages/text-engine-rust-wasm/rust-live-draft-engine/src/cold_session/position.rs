use super::{
    model::{Run, Shard, Span},
    tree::TreeWork,
};
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
    fn shifted(&self, delta: Delta, work: &mut TreeWork) -> Self;
    // One payload object plus the entries cloned in its owned vectors.
    fn copy_elements(&self) -> usize {
        1
    }
    fn copy_string_bytes(&self) -> usize {
        0
    }
    fn copy_vector_bytes(&self) -> usize {
        0
    }
    fn position_rewrites(&self) -> usize;
}
impl Positioned for Span {
    fn copy_string_bytes(&self) -> usize {
        self.span_id.len()
            + self.language.as_ref().map_or(0, String::len)
            + self.style_key.as_ref().map_or(0, String::len)
            + self.origin.as_ref().map_or(0,|o|o.span_id.len()+o.source_binding.len())
    }
    fn position_rewrites(&self) -> usize {
        2
    }
    fn start(&self) -> usize {
        self.start_offset
    }
    fn end(&self) -> usize {
        self.end_offset
    }
    fn shifted(&self, d: Delta, _work: &mut TreeWork) -> Self {
        let mut v = self.clone();
        v.start_offset = d.unit(v.start_offset);
        v.end_offset = d.unit(v.end_offset);
        v
    }
}
impl Positioned for Run {
    fn copy_string_bytes(&self) -> usize {
        let k = &self.key;
        [
            &k.script,
            &k.direction,
            &k.provider_run_id,
            &k.paragraph_base_direction,
            &k.writing_mode,
            &k.language,
            &k.font_id,
            &k.provider_id,
            &k.provider_revision,
        ]
        .iter()
        .map(|s| s.len())
        .sum::<usize>()
            + k.features.iter().map(String::len).sum::<usize>()
    }
    fn copy_vector_bytes(&self) -> usize {
        self.key.features.len() * std::mem::size_of::<String>()
    }
    fn position_rewrites(&self) -> usize {
        4
    }
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
    fn shifted(&self, d: Delta, work: &mut TreeWork) -> Self {
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
        work.provider_run_id_encoding_passes += 1;
        work.provider_run_id_encoded_bytes += v.key.provider_run_id.len() as u64;
        v
    }
}
impl Positioned for Shard {
    fn copy_vector_bytes(&self) -> usize {
        self.glyphs.len() * std::mem::size_of::<super::model::Glyph>()
            + (self.line_breaks.len() + self.grapheme_boundaries.len())
                * std::mem::size_of::<usize>()
            + self.concat_unsafe.len() * std::mem::size_of::<bool>()
    }
    fn position_rewrites(&self) -> usize {
        2 + self.glyphs.len() + self.line_breaks.len() + self.grapheme_boundaries.len()
    }
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
    fn shifted(&self, d: Delta, _work: &mut TreeWork) -> Self {
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
