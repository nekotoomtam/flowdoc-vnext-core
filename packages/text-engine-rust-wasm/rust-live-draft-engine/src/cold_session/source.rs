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
    offset_start: usize,
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
        offset_start: 0,
    }
}
impl Piece {
    fn offset(&self, at: usize, w: &mut TreeWork) -> Result<usize, &'static str> {
        w.reserve_source(1)?;
        w.source_offset_lookups += 1;
        let offset = self.offsets[self.offset_start + at - self.start];
        if offset == usize::MAX {
            Err("scalar-unsafe")
        } else {
            Ok(offset)
        }
    }
    fn view(&self, start: usize, end: usize, w: &mut TreeWork) -> Result<Self, &'static str> {
        let offset = self.offset(start, w)?;
        let _ = self.offset(end, w)?;
        w.reserve_source(1)?;
        w.source_offset_lookups += 1;
        w.payload_copy_calls += 1;
        w.payload_elements_copied += 1;
        w.position_rewrites += 3;
        Ok(Self {
            start,
            end,
            byte_start: self.byte_start + offset - self.offsets[self.offset_start],
            text: self.text.clone(),
            offsets: self.offsets.clone(),
            offset_start: self.offset_start + start - self.start,
        })
    }
}
impl Source {
    pub fn append(
        &self,
        text: &str,
        units: usize,
        w: &mut TreeWork,
    ) -> Result<Arc<Self>, &'static str> {
        if text.is_empty() {
            return if units == 0 {
                Ok(Arc::new(self.clone()))
            } else {
                Err("invalid-range")
            };
        }
        w.reserve_source(text.len() as u64)?;
        w.source_copy_calls += 1;
        w.source_copy_bytes += text.len() as u64;
        w.source_copied_utf16 += units as u64;
        let next = piece(self.units, self.bytes, text.to_owned(), w);
        if next.end - self.units != units {
            return Err("invalid-range");
        }
        Ok(Arc::new(Self {
            pieces: self.pieces.append(next, w),
            units: self.units + units,
            bytes: self.bytes + text.len(),
        }))
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
    // Views retain the immutable text and UTF-16 index. A view changes only
    // descriptor bounds; unchanged source is neither scanned nor copied.
    fn boundary(
        &self,
        at: usize,
        w: &mut TreeWork,
    ) -> Result<(usize, Option<Piece>, usize), &'static str> {
        if at > self.units {
            return Err("invalid-range");
        }
        if at == self.units {
            return Ok((self.pieces.len, None, self.bytes));
        }
        let found = self.pieces.containing(at, w).ok_or("missing-anchor")?;
        let p = found.materialize(w);
        let offset = p.offset(at, w)?;
        w.reserve_source(1)?;
        w.source_offset_lookups += 1;
        let byte = p.byte_start + offset - p.offsets[p.offset_start];
        Ok((found.index, Some(p), byte))
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
        if end - start > 512 {
            return Err("budget-exhaustion");
        }
        if start == self.units {
            return Ok(String::new());
        }
        let located = self.pieces.containing(start, w).ok_or("missing-anchor")?;
        let first = located.index;
        let p = located.materialize(w);
        let a = p.offset(start, w)?;
        if end <= p.end {
            let b = p.offset(end, w)?;
            w.source_copy_bytes += (b - a) as u64;
            w.source_copied_utf16 += (end - start) as u64;
            w.source_copy_calls += 1;
            return Ok(p.text[a..b].to_owned());
        }
        w.reserve_source(1)?;
        w.source_offset_lookups += 1;
        let start_byte = p.byte_start + a - p.offsets[p.offset_start];
        let first_piece = Some(p);
        let (last, _, end_byte) = self.boundary(end, w)?;
        if last.saturating_sub(first) > 512 {
            return Err("budget-exhaustion");
        }
        let mut result = String::with_capacity(end_byte - start_byte);
        let mut at = start;
        let mut next = first_piece;
        for index in first..self.pieces.len.min(last + 1) {
            if at == end {
                break;
            }
            let p = next
                .take()
                .unwrap_or_else(|| self.pieces.at(index, w).unwrap().materialize(w));
            if p.start > at || p.end <= at {
                return Err("missing-anchor");
            }
            let stop = end.min(p.end);
            let a = p.offset(at, w)?;
            let b = p.offset(stop, w)?;
            result.push_str(&p.text[a..b]);
            w.source_copy_bytes += (b - a) as u64;
            w.source_copied_utf16 += (stop - at) as u64;
            w.source_copy_calls += 1;
            at = stop;
        }
        if at != end {
            return Err("missing-anchor");
        }
        Ok(result)
    }
    pub fn split(
        &self,
        caret: usize,
        w: &mut TreeWork,
    ) -> Result<(Arc<Self>, Arc<Self>, usize), &'static str> {
        let (rank, p, byte) = self.boundary(caret, w).map_err(|e| {
            if e == "scalar-unsafe" {
                "unsafe-surrogate-pair"
            } else {
                e
            }
        })?;
        let delta = Delta {
            units: -(caret as isize),
            bytes: -(byte as isize),
            runs: 0,
        };
        let (left, right) = if let Some(p) = p.filter(|p| p.start < caret) {
            let left_piece = p.view(p.start, caret, w)?;
            let right_piece = p.view(caret, p.end, w)?;
            (
                self.pieces
                    .slice(0, rank, Delta::default(), w)
                    .append(left_piece, w),
                self.pieces
                    .splice(0, rank + 1, vec![right_piece], Delta::default(), w)
                    .slice(0, self.pieces.len - rank, delta, w),
            )
        } else {
            (
                self.pieces.slice(0, rank, Delta::default(), w),
                self.pieces.slice(rank, self.pieces.len, delta, w),
            )
        };
        Ok((
            Arc::new(Self {
                pieces: left,
                units: caret,
                bytes: byte,
            }),
            Arc::new(Self {
                pieces: right,
                units: self.units - caret,
                bytes: self.bytes - byte,
            }),
            byte,
        ))
    }
    pub fn replace(
        &self,
        start: usize,
        end: usize,
        replacement: &str,
        replacement_units: usize,
        w: &mut TreeWork,
    ) -> Result<Arc<Self>, &'static str> {
        if start > end || end > self.units {
            return Err("invalid-range");
        }
        if replacement_units > 512 || replacement.len() > 2048 {
            return Err("budget-exhaustion");
        }
        let (first, left, start_byte) = self.boundary(start, w)?;
        let (last, right, end_byte) = self.boundary(end, w)?;
        if last.saturating_sub(first) > 512 {
            return Err("budget-exhaustion");
        }
        let delta = Delta {
            units: replacement_units as isize - (end - start) as isize,
            bytes: replacement.len() as isize - (end_byte - start_byte) as isize,
            runs: 0,
        };
        let mut values = Vec::with_capacity(3);
        if let Some(p) = left.filter(|p| p.start < start) {
            values.push(p.view(p.start, start, w)?);
        }
        if !replacement.is_empty() {
            w.reserve_source(replacement.len() as u64)?;
            w.source_copy_bytes += replacement.len() as u64;
            w.source_copied_utf16 += replacement_units as u64;
            w.source_copy_calls += 1;
            let new = piece(start, start_byte, replacement.to_owned(), w);
            if new.end - start != replacement_units {
                return Err("invalid-range");
            }
            values.push(new);
        } else if replacement_units != 0 {
            return Err("invalid-range");
        }
        let mut remove_end = last;
        if let Some(p) = right.filter(|p| end > p.start) {
            values.push(p.view(end, p.end, w)?.shifted(delta, w));
            w.payload_copy_calls += 1;
            w.payload_elements_copied += 1;
            w.position_rewrites += 3;
            remove_end += 1;
        }
        let pieces = self.pieces.splice(first, remove_end, values, delta, w);
        Ok(Arc::new(Self {
            pieces,
            units: delta.unit(self.units),
            bytes: delta.byte(self.bytes),
        }))
    }
    // Used only by the private independent cold QA comparator, never commands.
    pub fn qa_text(&self) -> String {
        let mut text = String::new();
        self.pieces.visit(|p| {
            text.push_str(
                &p.text[p.offsets[p.offset_start]..p.offsets[p.offset_start + p.end - p.start]],
            )
        });
        text
    }
    #[cfg(test)]
    pub fn tail_from(&self, start: usize) -> String {
        let mut text = String::new();
        self.pieces.visit(|p| {
            if p.end > start {
                let local = start.saturating_sub(p.start);
                text.push_str(
                    &p.text[p.offsets[p.offset_start + local]
                        ..p.offsets[p.offset_start + p.end - p.start]],
                );
            }
        });
        text
    }
}
#[cfg(test)]
mod foundation_tests {
    use super::*;
    fn source(text: &str) -> Arc<Source> {
        Source::cold(text.into(), &[], &mut Work::default())
    }
    #[test]
    fn foundation_cross_piece_window_and_replace() {
        let mut w = TreeWork::default();
        let s = source("")
            .append("AB", 2, &mut w)
            .unwrap()
            .append("ก😀", 3, &mut w)
            .unwrap()
            .append("CD", 2, &mut w)
            .unwrap();
        assert_eq!(s.window(1, 6, &mut w).unwrap(), "Bก😀C");
        let edited = s.replace(1, 6, "X", 1, &mut w).unwrap();
        assert_eq!(edited.window(0, 3, &mut w).unwrap(), "AXD");
        assert!(s.window(4, 4, &mut w).is_err());
        assert!(s.replace(4, 4, "", 0, &mut w).is_err());
        assert!(s.replace(5, 4, "", 0, &mut w).is_err());
        let empty = s.replace(0, 7, "", 0, &mut w).unwrap();
        assert_eq!(empty.utf16(), 0);
        assert_eq!(empty.stats().node_count, 0);
    }
    #[test]
    fn foundation_views_share_text_indexes_and_work_tracks_new_text_only() {
        let initial = source("")
            .append(&"A".repeat(400), 400, &mut TreeWork::default())
            .unwrap();
        let old = initial.payload(0);
        let mut w = TreeWork::default();
        let next = initial.replace(100, 101, "ก", 1, &mut w).unwrap();
        assert_eq!(
            next.qa_text(),
            format!("{}ก{}", "A".repeat(100), "A".repeat(299))
        );
        for index in [0, 2] {
            let p = next.payload(index);
            assert!(Arc::ptr_eq(&old.text, &p.text));
            assert!(Arc::ptr_eq(&old.offsets, &p.offsets));
        }
        assert_eq!(w.source_index_utf16, 1);
        assert_eq!(w.source_copy_bytes, 6);
        assert_eq!(w.source_copied_utf16, 2);
        let (a, b, byte) = next.split(200, &mut TreeWork::default()).unwrap();
        assert_eq!(byte, 202);
        assert_eq!(a.bytes() + b.bytes(), next.bytes());
        assert_eq!(format!("{}{}", a.qa_text(), b.qa_text()), next.qa_text());
        assert!(Arc::ptr_eq(&old.text, &b.payload(0).text));
        a.recursive_stats();
        b.recursive_stats();
        for (start, end, text, units, want) in [
            (0, 0, "B", 1, format!("B{}", "A".repeat(400))),
            (400, 400, "B", 1, format!("{}B", "A".repeat(400))),
            (0, 400, "", 0, String::new()),
        ] {
            let out = initial
                .replace(start, end, text, units, &mut TreeWork::default())
                .unwrap();
            assert_eq!(out.qa_text(), want);
            out.recursive_stats();
        }
    }
    #[test]
    fn foundation_fragmented_window_stops_before_cumulative_source_allowance() {
        let mut s = source("");
        for _ in 0..300 {
            s = s.append("A", 1, &mut TreeWork::default()).unwrap();
        }
        let mut w = TreeWork::default();
        w.source_allowance(480);
        assert_eq!(s.window(0, 300, &mut w), Err("budget-exhaustion"));
        assert!(w.source_offset_lookups <= 32);
        assert!(w.source_copied_utf16 < 32);
        assert_eq!(s.qa_text(), "A".repeat(300));
    }
}
