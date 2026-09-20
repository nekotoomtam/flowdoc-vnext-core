use super::{
    ledger::Work,
    model::Shard,
    position::{Delta, Positioned},
    tree::{Tree, TreeWork},
};
use std::sync::Arc;
#[derive(Clone)]
pub(super) struct Piece {
    start: usize,
    end: usize,
    byte_start: usize,
    text: Arc<str>,
    offsets: Arc<Vec<usize>>,
}
impl Positioned for Piece {
    fn start(&self) -> usize {
        self.start
    }
    fn end(&self) -> usize {
        self.end
    }
    fn shifted(&self, d: Delta) -> Self {
        let mut p = self.clone();
        p.start = d.unit(p.start);
        p.end = d.unit(p.end);
        p.byte_start = d.byte(p.byte_start);
        p
    }
}
#[derive(Clone)]
pub(super) struct Source {
    pieces: Tree<Piece>,
    units: usize,
    bytes: usize,
}
fn piece(start: usize, byte_start: usize, text: String) -> Piece {
    let mut offsets = Vec::new();
    for (b, c) in text.char_indices() {
        offsets.push(b);
        if c.len_utf16() == 2 {
            offsets.push(usize::MAX)
        }
    }
    offsets.push(text.len());
    Piece {
        start,
        end: start + offsets.len() - 1,
        byte_start,
        text: Arc::from(text),
        offsets: Arc::new(offsets),
    }
}
impl Source {
    pub fn cold(text: String, shards: &[Shard], work: &mut Work) -> Arc<Self> {
        let units = text.encode_utf16().count();
        let bytes = text.len();
        let mut byte_offsets = Vec::new();
        work.source_index_utf16 += (3 * units) as u64;
        for (b, c) in text.char_indices() {
            byte_offsets.push(b);
            if c.len_utf16() == 2 {
                byte_offsets.push(usize::MAX)
            }
        }
        byte_offsets.push(bytes);
        let pieces = shards
            .iter()
            .map(|s| {
                let a = byte_offsets[s.start_offset];
                let b = byte_offsets[s.end_offset];
                work.source_copy_bytes += (b - a) as u64;
                piece(s.start_offset, a, text[a..b].to_string())
            })
            .collect();
        Arc::new(Self {
            pieces: Tree::build(pieces, work),
            units,
            bytes,
        })
    }
    pub fn utf16(&self) -> usize {
        self.units
    }
    pub fn bytes(&self) -> usize {
        self.bytes
    }
    pub fn window(
        &self,
        start: usize,
        end: usize,
        w: &mut TreeWork,
    ) -> Result<String, &'static str> {
        if start > end || end > self.units {
            return Err("invalid-range");
        }
        if start == end {
            return Ok(String::new());
        }
        let found = self.pieces.containing(start, w).ok_or("missing-anchor")?;
        let p = found.materialize();
        if end > p.end {
            return Err("budget-exhaustion");
        }
        let a = p.offsets[start - p.start];
        let b = p.offsets[end - p.start];
        if a == usize::MAX || b == usize::MAX {
            return Err("scalar-unsafe");
        }
        Ok(p.text[a..b].to_string())
    }
    pub fn replace(
        &self,
        start: usize,
        end: usize,
        replacement: &str,
        w: &mut TreeWork,
    ) -> Result<Arc<Self>, &'static str> {
        let located = if start == self.units {
            self.pieces
                .at(self.pieces.len.checked_sub(1).ok_or("missing-anchor")?, w)
        } else {
            self.pieces.containing(start, w)
        }
        .ok_or("missing-anchor")?;
        let p = located.materialize();
        if end > p.end {
            return Err("budget-exhaustion");
        }
        let a = p.offsets[start - p.start];
        let b = p.offsets[end - p.start];
        if a == usize::MAX || b == usize::MAX {
            return Err("scalar-unsafe");
        }
        let text = format!("{}{}{}", &p.text[..a], replacement, &p.text[b..]);
        let next = piece(p.start, p.byte_start, text);
        let delta = Delta {
            units: next.end as isize - p.end as isize,
            bytes: next.text.len() as isize - p.text.len() as isize,
        };
        let pieces = if next.text.is_empty() && located.index + 1 == self.pieces.len {
            self.pieces.without_last(w)
        } else {
            self.pieces.replace_and_shift(located.index, next, delta, w)
        };
        Ok(Arc::new(Self {
            pieces,
            units: delta.unit(self.units),
            bytes: delta.byte(self.bytes),
        }))
    }
    #[cfg(test)]
    pub fn tail_from(&self, start: usize) -> String {
        let mut text = String::new();
        self.pieces.visit(|p| {
            if p.end > start {
                let local = start.saturating_sub(p.start);
                text.push_str(&p.text[p.offsets[local]..]);
            }
        });
        text
    }
}
