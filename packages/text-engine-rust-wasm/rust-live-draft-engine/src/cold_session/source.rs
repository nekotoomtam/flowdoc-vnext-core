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
    fn position_rewrites(&self) -> usize {
        3
    }
    fn start(&self) -> usize {
        self.start
    }
    fn end(&self) -> usize {
        self.end
    }
    fn shifted(&self, d: Delta, _work: &mut TreeWork) -> Self {
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
fn piece(start: usize, byte_start: usize, text: String, work: &mut TreeWork) -> Piece {
    let mut offsets = Vec::new();
    for (b, c) in text.char_indices() {
        work.source_index_utf16 += c.len_utf16() as u64;
        offsets.push(b);
        if c.len_utf16() == 2 {
            offsets.push(usize::MAX)
        }
    }
    offsets.push(text.len());
    work.source_copy_bytes += text.len() as u64;
    work.source_copied_utf16 += (offsets.len() - 1) as u64;
    work.source_copy_calls += 1;
    Piece {
        start,
        end: start + offsets.len() - 1,
        byte_start,
        text: Arc::from(text),
        offsets: Arc::new(offsets),
    }
}
impl Source {
    pub fn append(&self, text: &str, units: usize, w: &mut TreeWork) -> Arc<Self> {
        w.source_copy_calls+=1;w.source_copy_bytes+=text.len() as u64;w.source_copied_utf16+=units as u64;
        let next=piece(self.units,self.bytes,text.to_owned(),w);
        Arc::new(Self{pieces:self.pieces.append(next,w),units:self.units+units,bytes:self.bytes+text.len()})
    }
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
                let mut piece_work = TreeWork::default();
                let result = piece(s.start_offset, a, text[a..b].to_string(), &mut piece_work);
                work.source_copy_bytes += (b - a) as u64 + piece_work.source_copy_bytes;
                result
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
    pub fn stats(&self) -> super::structure::TreeStats {
        self.pieces.stats()
    }
    #[cfg(test)]
    pub fn recursive_stats(&self) -> super::structure::TreeStats {
        self.pieces.recursive_stats()
    }
    #[cfg(test)]
    pub fn payload(&self, index: usize) -> Arc<Piece> {
        self.pieces.payload(index)
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
        let p = found.materialize(w);
        if end > p.end {
            return Err("budget-exhaustion");
        }
        let a = p.offsets[start - p.start];
        let b = p.offsets[end - p.start];
        w.source_offset_lookups += 2;
        if a == usize::MAX || b == usize::MAX {
            return Err("scalar-unsafe");
        }
        w.source_copy_bytes += (b - a) as u64;
        w.source_copied_utf16 += (end - start) as u64;
        w.source_copy_calls += 1;
        Ok(p.text[a..b].to_string())
    }
    pub fn split(&self, caret: usize, w: &mut TreeWork) -> Result<(Arc<Self>, Arc<Self>, usize), &'static str> {
        if caret > self.units { return Err("invalid-range"); }
        if caret == 0 || caret == self.units {
            let empty = Arc::new(Self {pieces:self.pieces.slice(0,0,Delta::default(),w), units:0, bytes:0});
            return Ok(if caret == 0 {(empty, Arc::new(self.clone()), 0)} else {(Arc::new(self.clone()), empty, self.bytes)});
        }
        let found = self.pieces.containing(caret, w).ok_or("missing-anchor")?;
        let p = found.materialize(w);
        let offset = p.offsets[caret-p.start];
        w.source_offset_lookups += 1;
        if offset == usize::MAX {return Err("unsafe-surrogate-pair");}
        let byte = p.byte_start + offset;
        let delta = Delta {units:-(caret as isize), bytes:-(byte as isize)};
        let (left,right) = if caret == p.start {
            (self.pieces.slice(0,found.index,Delta::default(),w),self.pieces.slice(found.index,self.pieces.len,delta,w))
        } else {
            // Only the seam piece is copied. The UTF-16 index is local and metered.
            w.source_copy_calls += 2;
            w.source_copy_bytes += p.text.len() as u64;
            w.source_copied_utf16 += (p.end-p.start) as u64;
            let a = piece(p.start,p.byte_start,p.text[..offset].to_string(),w);
            let b = piece(caret,byte,p.text[offset..].to_string(),w);
            (self.pieces.replace_and_shift(found.index,a,Delta::default(),w).slice(0,found.index+1,Delta::default(),w),
             self.pieces.replace_and_shift(found.index,b,Delta::default(),w).slice(found.index,self.pieces.len,delta,w))
        };
        Ok((Arc::new(Self {pieces:left,units:caret,bytes:byte}),Arc::new(Self {pieces:right,units:self.units-caret,bytes:self.bytes-byte}),byte))
    }
    pub fn replace(
        &self,
        start: usize,
        end: usize,
        replacement: &str,
        replacement_units: usize,
        w: &mut TreeWork,
    ) -> Result<Arc<Self>, &'static str> {
        let located = if start == self.units {
            self.pieces
                .at(self.pieces.len.checked_sub(1).ok_or("missing-anchor")?, w)
        } else {
            self.pieces.containing(start, w)
        }
        .ok_or("missing-anchor")?;
        let p = located.materialize(w);
        if end > p.end {
            return Err("budget-exhaustion");
        }
        let a = p.offsets[start - p.start];
        let b = p.offsets[end - p.start];
        w.source_offset_lookups += 2;
        if a == usize::MAX || b == usize::MAX {
            return Err("scalar-unsafe");
        }
        let text = format!("{}{}{}", &p.text[..a], replacement, &p.text[b..]);
        w.source_copy_bytes += text.len() as u64;
        w.source_copied_utf16 += (p.end - p.start - (end - start) + replacement_units) as u64;
        w.source_copy_calls += 1;
        let next = piece(p.start, p.byte_start, text, w);
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
