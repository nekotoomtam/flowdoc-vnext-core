use super::{
    model::Span,
    position::Delta,
    tree::{Tree, TreeWork},
};

pub(super) struct Selection {
    pub index: usize,
    pub span: Span,
    pub second: Option<Span>,
    pub edge: bool,
}

fn matches(id: &str, anchor: &str, work: &mut TreeWork) -> bool {
    if id.len() != anchor.len() {
        return false;
    }
    id.bytes().zip(anchor.bytes()).all(|(a, b)| {
        work.anchor_comparison_bytes += 1;
        a == b
    })
}

// IDs were validated unique at construction. Inspect only the two adjacent
// spans; neither analysis-run membership nor a document-wide ID search owns intent.
pub(super) fn select(
    spans: &Tree<Span>,
    start: usize,
    end: usize,
    total: usize,
    replacement_empty: bool,
    anchor: &str,
    work: &mut TreeWork,
) -> Result<Selection, &'static str> {
    if anchor.is_empty() {
        return Err("missing-anchor");
    }
    let locate = if start == total {
        total.checked_sub(1).ok_or("missing-anchor")?
    } else {
        start
    };
    let at = spans.containing(locate, work).ok_or("missing-anchor")?;
    work.ownership_span_visits += 1;
    let span = at.materialize(work);
    if start == end && start == span.start_offset && at.index > 0 {
        let left = spans
            .at(at.index - 1, work)
            .ok_or("missing-anchor")?
            .materialize(work);
        work.ownership_span_visits += 1;
        if left.end_offset != start {
            return Err("ambiguous-anchor");
        }
        let l = matches(&left.span_id, anchor, work);
        let r = matches(&span.span_id, anchor, work);
        return match (l, r) {
            (true, false) => Ok(Selection {
                index: at.index - 1,
                span: left,
                second: None,
                edge: true,
            }),
            (false, true) => Ok(Selection {
                index: at.index,
                span,
                second: None,
                edge: true,
            }),
            _ => Err("ambiguous-anchor"),
        };
    }
    if end > span.end_offset {
        if !replacement_empty || start <= span.start_offset {
            return Err("unsupported-command-shape");
        }
        let right = spans
            .at(at.index + 1, work)
            .ok_or("unsupported-command-shape")?
            .materialize(work);
        work.ownership_span_visits += 1;
        if right.start_offset != span.end_offset || end >= right.end_offset {
            return Err("unsupported-command-shape");
        }
        if !matches(&span.span_id, anchor, work) && !matches(&right.span_id, anchor, work) {
            return Err("ambiguous-anchor");
        }
        return Ok(Selection {
            index: at.index,
            span,
            second: Some(right),
            edge: true,
        });
    }
    if !matches(&span.span_id, anchor, work) {
        return Err("ambiguous-anchor");
    }
    // The ordinary path owns this exact anchored range, not the session's
    // cardinality. Cross-span edits have only the bounded edge path above.
    // Removing an authored identity is still outside the ordinary contract.
    if start < span.start_offset
        || end > span.end_offset
        || (replacement_empty && start == span.start_offset && end == span.end_offset)
    {
        return Err("unsupported-command-shape");
    }
    Ok(Selection {
        index: at.index,
        span,
        second: None,
        edge: false,
    })
}

impl Selection {
    pub fn publish(
        self,
        spans: &Tree<Span>,
        start: usize,
        end: usize,
        delta: Delta,
        work: &mut TreeWork,
    ) -> Tree<Span> {
        let mut first = self.span;
        if let Some(mut second) = self.second {
            let first_delta = Delta {
                units: start as isize - first.end_offset as isize,
                bytes: 0, runs: 0 };
            let second_delta = Delta {
                units: second.start_offset as isize - end as isize,
                bytes: 0, runs: 0 };
            first.end_offset = start;
            second.start_offset = start;
            second.end_offset = delta.unit(second.end_offset);
            work.position_rewrites += 3;
            spans
                .replace_and_shift(self.index, first, first_delta, work)
                .replace_and_shift(self.index + 1, second, second_delta, work)
        } else {
            first.end_offset = delta.unit(first.end_offset);
            work.position_rewrites += 1;
            spans.replace_and_shift(self.index, first, delta, work)
        }
    }
}
