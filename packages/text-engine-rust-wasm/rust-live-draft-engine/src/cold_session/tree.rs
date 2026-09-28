use super::{
    ledger::Work,
    position::{Delta, Positioned},
};
use std::sync::Arc;
pub(super) struct Tree<T> {
    root: Option<Arc<Node<T>>>,
    pub len: usize,
    pub height: usize,
}
struct Node<T> {
    value: Arc<T>,
    left: Option<Arc<Node<T>>>,
    right: Option<Arc<Node<T>>>,
    count: usize,
    height: usize,
    shift: Delta,
    value_shift: Delta,
}
impl<T> Clone for Tree<T> {
    fn clone(&self) -> Self {
        Self {
            root: self.root.clone(),
            len: self.len,
            height: self.height,
        }
    }
}
impl<T> Clone for Node<T> {
    fn clone(&self) -> Self {
        Self {
            value: self.value.clone(),
            left: self.left.clone(),
            right: self.right.clone(),
            count: self.count,
            height: self.height,
            shift: self.shift,
            value_shift: self.value_shift,
        }
    }
}
#[derive(Default, Debug)]
pub(super) struct TreeWork {
    pub source_read_limit: Option<u64>,
    pub ownership_span_visits: u64,
    pub anchor_comparison_bytes: u64,
    pub visits: u64,
    pub copies: u64,
    pub shared_subtrees: u64,
    pub shifted_subtrees: u64,
    pub payload_copy_calls: u64,
    pub payload_elements_copied: u64,
    pub payload_string_bytes_copied: u64,
    pub payload_vector_bytes_copied: u64,
    pub position_rewrites: u64,
    pub provider_run_id_encoding_passes: u64,
    pub provider_run_id_encoded_bytes: u64,
    pub source_copy_bytes: u64,
    pub source_copied_utf16: u64,
    pub source_copy_calls: u64,
    pub source_index_utf16: u64,
    pub source_offset_lookups: u64,
}
impl TreeWork {
    pub fn source_allowance(&mut self, external: u64) {
        self.source_read_limit = Some(512u64.saturating_sub(external));
    }
    pub fn reserve_source(&self, units: u64) -> Result<(), &'static str> {
        if self.source_index_utf16 + self.source_offset_lookups + units
            > self.source_read_limit.unwrap_or(512)
        {
            Err("budget-exhaustion")
        } else {
            Ok(())
        }
    }
}
pub(super) struct Located<T> {
    pub value: Arc<T>,
    pub delta: Delta,
    pub index: usize,
}
impl<T: Positioned> Located<T> {
    pub fn materialize(&self, work: &mut TreeWork) -> T {
        work.payload_copy_calls += 1;
        work.payload_elements_copied += self.value.copy_elements() as u64;
        work.payload_string_bytes_copied += self.value.copy_string_bytes() as u64;
        work.payload_vector_bytes_copied += self.value.copy_vector_bytes() as u64;
        work.position_rewrites += self.value.position_rewrites() as u64;
        self.value.shifted(self.delta, work)
    }
}
impl<T: Positioned> Tree<T> {
    pub fn exclusively_released_payloads(&self, w: &mut TreeWork) -> usize {
        fn count<T>(node: &Option<Arc<Node<T>>>, w: &mut TreeWork) -> usize {
            let Some(node) = node else { return 0; };
            w.visits += 1;
            if Arc::strong_count(node) != 1 { return 0; }
            usize::from(Arc::strong_count(&node.value) == 1) + count(&node.left,w) + count(&node.right,w)
        }
        count(&self.root,w)
    }
    pub fn exclusive_singleton_payload(&self) -> bool {
        self.len == 1 && self.root.as_ref().is_some_and(|root| {
            Arc::strong_count(root) == 1 && Arc::strong_count(&root.value) == 1 &&
                root.left.is_none() && root.right.is_none()
        })
    }
    // Persistent AVL tail insertion. Push lazy coordinates into descriptor
    // offsets/child roots only; retained payloads are never materialized.
    pub fn append(&self, value: T, w: &mut TreeWork) -> Self {
        fn size<T>(n: &Option<Arc<Node<T>>>) -> usize {
            n.as_ref().map_or(0, |v| v.count)
        }
        fn height<T>(n: &Option<Arc<Node<T>>>) -> usize {
            n.as_ref().map_or(0, |v| v.height)
        }
        fn refresh<T>(n: &mut Node<T>) {
            n.count = 1 + size(&n.left) + size(&n.right);
            n.height = 1 + height(&n.left).max(height(&n.right));
        }
        fn push<T>(n: &Arc<Node<T>>, w: &mut TreeWork) -> Node<T> {
            w.visits += 1;
            w.copies += 1;
            let mut c = (**n).clone();
            let d = c.shift;
            c.value_shift = c.value_shift.plus(d);
            c.shift = Delta::default();
            for child in [&mut c.left, &mut c.right] {
                if let Some(old) = child {
                    w.shared_subtrees += 1;
                    if !d.is_zero() {
                        let mut v = (**old).clone();
                        v.shift = v.shift.plus(d);
                        w.copies += 1;
                        w.shifted_subtrees += 1;
                        *old = Arc::new(v);
                    }
                }
            }
            c
        }
        fn insert<T>(node: &Option<Arc<Node<T>>>, value: Arc<T>, w: &mut TreeWork) -> Arc<Node<T>> {
            let Some(node) = node else {
                w.copies += 1;
                return Arc::new(Node {
                    value,
                    left: None,
                    right: None,
                    count: 1,
                    height: 1,
                    shift: Delta::default(),
                    value_shift: Delta::default(),
                });
            };
            let mut c = push(node, w);
            c.right = Some(insert(&c.right, value, w));
            refresh(&mut c);
            if height(&c.right) > height(&c.left) + 1 {
                // Tail insertion only grows the right spine; one left rotation.
                let mut r = push(c.right.as_ref().unwrap(), w);
                c.right = r.left.take();
                refresh(&mut c);
                r.left = Some(Arc::new(c));
                refresh(&mut r);
                Arc::new(r)
            } else {
                Arc::new(c)
            }
        }
        let root = Some(insert(&self.root, Arc::new(value), w));
        Self {
            len: self.len + 1,
            height: root.as_ref().unwrap().height,
            root,
        }
    }
    pub fn build(values: Vec<T>, work: &mut Work) -> Self {
        fn build<T>(
            it: &mut std::vec::IntoIter<T>,
            n: usize,
            w: &mut Work,
        ) -> (Option<Arc<Node<T>>>, usize) {
            if n == 0 {
                return (None, 0);
            }
            let (left, lh) = build(it, n / 2, w);
            let value = Arc::new(it.next().unwrap());
            let (right, rh) = build(it, n - n / 2 - 1, w);
            w.tree_nodes += 1;
            w.tree_construction_visits += 1;
            (
                Some(Arc::new(Node {
                    value,
                    left,
                    right,
                    count: n,
                    height: 1 + lh.max(rh),
                    shift: Delta::default(),
                    value_shift: Delta::default(),
                })),
                1 + lh.max(rh),
            )
        }
        let len = values.len();
        let (root, height) = build(&mut values.into_iter(), len, work);
        Self { root, len, height }
    }
    pub fn at(&self, index: usize, w: &mut TreeWork) -> Option<Located<T>> {
        let mut node = self.root.as_ref()?;
        let mut base = Delta::default();
        let mut rank = index;
        let mut prefix = 0;
        loop {
            w.visits += 1;
            base = base.plus(node.shift);
            let left = node.left.as_ref().map_or(0, |n| n.count);
            if rank == left {
                return Some(Located {
                    value: node.value.clone(),
                    delta: base.plus(node.value_shift),
                    index: prefix + left,
                });
            }
            if rank < left {
                node = node.left.as_ref()?
            } else {
                rank -= left + 1;
                prefix += left + 1;
                node = node.right.as_ref()?
            }
        }
    }
    pub fn containing(&self, offset: usize, w: &mut TreeWork) -> Option<Located<T>> {
        let mut node = self.root.as_ref()?;
        let mut base = Delta::default();
        let mut prefix = 0;
        loop {
            w.visits += 1;
            base = base.plus(node.shift);
            let d = base.plus(node.value_shift);
            let left = node.left.as_ref().map_or(0, |n| n.count);
            if offset < d.unit(node.value.start()) {
                node = node.left.as_ref()?
            } else if offset >= d.unit(node.value.end()) {
                prefix += left + 1;
                node = node.right.as_ref()?
            } else {
                return Some(Located {
                    value: node.value.clone(),
                    delta: d,
                    index: prefix + left,
                });
            }
        }
    }
    // AVL join descends only the taller spine. Lazy deltas stay on descriptors,
    // so neither rotations nor range splices clone retained payload vectors.
    fn from_root(root: Option<Arc<Node<T>>>) -> Self {
        Self {
            len: node_size(&root),
            height: node_height(&root),
            root,
        }
    }
    pub fn slice(&self, start: usize, end: usize, delta: Delta, w: &mut TreeWork) -> Self {
        assert!(start <= end && end <= self.len);
        let (_, rest) = split_node(self.root.clone(), start, w);
        let (part, _) = split_node(rest, end - start, w);
        Self::from_root(shift_node(part, delta, w))
    }
    pub fn splice(
        &self,
        start: usize,
        end: usize,
        values: Vec<T>,
        delta: Delta,
        w: &mut TreeWork,
    ) -> Self {
        assert!(start <= end && end <= self.len);
        let (left, rest) = split_node(self.root.clone(), start, w);
        let (_, right) = split_node(rest, end - start, w);
        let mut middle = Self::from_root(None);
        for value in values {
            middle = middle.append(value, w);
        }
        let right = shift_node(right, delta, w);
        Self::from_root(concat_node(concat_node(left, middle.root, w), right, w))
    }
    pub fn replace_and_shift(
        &self,
        index: usize,
        value: T,
        delta: Delta,
        w: &mut TreeWork,
    ) -> Self {
        fn shift<T>(
            node: &Option<Arc<Node<T>>>,
            d: Delta,
            w: &mut TreeWork,
        ) -> Option<Arc<Node<T>>> {
            node.as_ref().map(|n| {
                let mut copy = (**n).clone();
                copy.shift = copy.shift.plus(d);
                w.copies += 1;
                w.shifted_subtrees += 1;
                w.shared_subtrees += 1;
                Arc::new(copy)
            })
        }
        fn update<T: Positioned>(
            node: &Arc<Node<T>>,
            rank: usize,
            value: &T,
            d: Delta,
            base: Delta,
            w: &mut TreeWork,
        ) -> Arc<Node<T>> {
            w.visits += 1;
            w.copies += 1;
            let mut copy = (**node).clone();
            let base = base.plus(node.shift);
            let left = node.left.as_ref().map_or(0, |n| n.count);
            if rank < left {
                copy.left = Some(update(node.left.as_ref().unwrap(), rank, value, d, base, w));
                copy.value_shift = copy.value_shift.plus(d);
                copy.right = shift(&node.right, d, w);
            } else if rank == left {
                w.payload_copy_calls += 1;
                w.payload_elements_copied += value.copy_elements() as u64;
                w.payload_string_bytes_copied += value.copy_string_bytes() as u64;
                w.payload_vector_bytes_copied += value.copy_vector_bytes() as u64;
                w.position_rewrites += value.position_rewrites() as u64;
                copy.value = Arc::new(value.shifted(base.inverse(), w));
                copy.value_shift = Delta::default();
                copy.right = shift(&node.right, d, w);
                if copy.left.is_some() {
                    w.shared_subtrees += 1;
                }
            } else {
                copy.right = Some(update(
                    node.right.as_ref().unwrap(),
                    rank - left - 1,
                    value,
                    d,
                    base,
                    w,
                ));
                if copy.left.is_some() {
                    w.shared_subtrees += 1;
                }
            }
            Arc::new(copy)
        }
        Self {
            root: Some(update(
                self.root.as_ref().unwrap(),
                index,
                &value,
                delta,
                Delta::default(),
                w,
            )),
            len: self.len,
            height: self.height,
        }
    }
    #[cfg(test)]
    pub fn last(&self) -> Option<T> {
        self.at(self.len.checked_sub(1)?, &mut TreeWork::default())
            .map(|v| v.materialize(&mut TreeWork::default()))
    }
    pub fn without_last(&self, w: &mut TreeWork) -> Self {
        self.slice(0, self.len.saturating_sub(1), Delta::default(), w)
    }
    pub fn stats(&self) -> super::structure::TreeStats {
        super::structure::TreeStats {
            node_count: self.root.as_ref().map_or(0, |n| n.count),
            height: self.root.as_ref().map_or(0, |n| n.height),
        }
    }
    #[cfg(test)]
    pub fn recursive_stats(&self) -> super::structure::TreeStats {
        fn walk<T>(node: &Option<Arc<Node<T>>>) -> super::structure::TreeStats {
            let Some(node) = node else {
                return super::structure::TreeStats::default();
            };
            let l = walk(&node.left);
            let r = walk(&node.right);
            let result = super::structure::TreeStats {
                node_count: 1 + l.node_count + r.node_count,
                height: 1 + l.height.max(r.height),
            };
            assert!(l.height.abs_diff(r.height) <= 1, "AVL balance");
            assert_eq!(node.count, result.node_count);
            assert_eq!(node.height, result.height);
            result
        }
        walk(&self.root)
    }
    #[allow(dead_code)]
    pub fn visit(&self, mut f: impl FnMut(&T)) {
        fn visit<T: Positioned>(node: &Option<Arc<Node<T>>>, d: Delta, f: &mut impl FnMut(&T)) {
            if let Some(n) = node {
                let d = d.plus(n.shift);
                visit(&n.left, d, f);
                f(&n.value
                    .shifted(d.plus(n.value_shift), &mut TreeWork::default()));
                visit(&n.right, d, f)
            }
        }
        visit(&self.root, Delta::default(), &mut f)
    }
    pub fn visit_borrowed(&self, w: &mut TreeWork, mut f: impl FnMut(&T)) {
        fn visit<T>(node: &Option<Arc<Node<T>>>, w: &mut TreeWork, f: &mut impl FnMut(&T)) {
            if let Some(n) = node {
                w.visits += 1;
                visit(&n.left,w,f);
                f(&n.value);
                visit(&n.right,w,f);
            }
        }
        visit(&self.root,w,&mut f);
    }
    #[cfg(test)]
    pub fn payload(&self, index: usize) -> Arc<T> {
        self.at(index, &mut TreeWork::default()).unwrap().value
    }
}

fn node_size<T>(n: &Option<Arc<Node<T>>>) -> usize {
    n.as_ref().map_or(0, |n| n.count)
}
fn node_height<T>(n: &Option<Arc<Node<T>>>) -> usize {
    n.as_ref().map_or(0, |n| n.height)
}
fn refresh<T>(n: &mut Node<T>) {
    n.count = 1 + node_size(&n.left) + node_size(&n.right);
    n.height = 1 + node_height(&n.left).max(node_height(&n.right));
}
fn shift_node<T>(node: Option<Arc<Node<T>>>, d: Delta, w: &mut TreeWork) -> Option<Arc<Node<T>>> {
    node.map(|n| {
        w.shared_subtrees += 1;
        if d.is_zero() {
            return n;
        }
        let mut c = (*n).clone();
        c.shift = c.shift.plus(d);
        w.copies += 1;
        w.shifted_subtrees += 1;
        Arc::new(c)
    })
}
fn push_node<T>(n: &Arc<Node<T>>, w: &mut TreeWork) -> Node<T> {
    w.visits += 1;
    w.copies += 1;
    let mut c = (**n).clone();
    c.value_shift = c.value_shift.plus(c.shift);
    c.left = shift_node(c.left, c.shift, w);
    c.right = shift_node(c.right, c.shift, w);
    c.shift = Delta::default();
    c
}
fn balance_node<T>(mut n: Node<T>, w: &mut TreeWork) -> Arc<Node<T>> {
    refresh(&mut n);
    if node_height(&n.left) > node_height(&n.right) + 1 {
        let mut l = push_node(n.left.as_ref().unwrap(), w);
        if node_height(&l.right) > node_height(&l.left) {
            let mut r = push_node(l.right.as_ref().unwrap(), w);
            l.right = r.left.take();
            refresh(&mut l);
            r.left = Some(Arc::new(l));
            refresh(&mut r);
            l = r;
        }
        n.left = l.right.take();
        refresh(&mut n);
        l.right = Some(Arc::new(n));
        refresh(&mut l);
        Arc::new(l)
    } else if node_height(&n.right) > node_height(&n.left) + 1 {
        let mut r = push_node(n.right.as_ref().unwrap(), w);
        if node_height(&r.left) > node_height(&r.right) {
            let mut l = push_node(r.left.as_ref().unwrap(), w);
            r.left = l.right.take();
            refresh(&mut r);
            l.right = Some(Arc::new(r));
            refresh(&mut l);
            r = l;
        }
        n.right = r.left.take();
        refresh(&mut n);
        r.left = Some(Arc::new(n));
        refresh(&mut r);
        Arc::new(r)
    } else {
        Arc::new(n)
    }
}
fn join_node<T>(
    left: Option<Arc<Node<T>>>,
    mut pivot: Node<T>,
    right: Option<Arc<Node<T>>>,
    w: &mut TreeWork,
) -> Arc<Node<T>> {
    if node_height(&left) > node_height(&right) + 1 {
        let mut l = push_node(left.as_ref().unwrap(), w);
        l.right = Some(join_node(l.right.take(), pivot, right, w));
        balance_node(l, w)
    } else if node_height(&right) > node_height(&left) + 1 {
        let mut r = push_node(right.as_ref().unwrap(), w);
        r.left = Some(join_node(left, pivot, r.left.take(), w));
        balance_node(r, w)
    } else {
        pivot.left = left;
        pivot.right = right;
        refresh(&mut pivot);
        Arc::new(pivot)
    }
}
fn split_node<T>(
    node: Option<Arc<Node<T>>>,
    rank: usize,
    w: &mut TreeWork,
) -> (Option<Arc<Node<T>>>, Option<Arc<Node<T>>>) {
    if rank == 0 {
        if node.is_some() {
            w.shared_subtrees += 1;
        }
        return (None, node);
    }
    if rank == node_size(&node) {
        if node.is_some() {
            w.shared_subtrees += 1;
        }
        return (node, None);
    }
    let mut n = push_node(node.as_ref().unwrap(), w);
    let left = n.left.take();
    let right = n.right.take();
    let count = node_size(&left);
    if rank <= count {
        let (a, b) = split_node(left, rank, w);
        (a, Some(join_node(b, n, right, w)))
    } else {
        let (a, b) = split_node(right, rank - count - 1, w);
        (Some(join_node(left, n, a, w)), b)
    }
}
fn concat_node<T>(
    left: Option<Arc<Node<T>>>,
    right: Option<Arc<Node<T>>>,
    w: &mut TreeWork,
) -> Option<Arc<Node<T>>> {
    if left.is_none() {
        return right;
    }
    if right.is_none() {
        return left;
    }
    let (pivot, rest) = split_node(right, 1, w);
    let pivot = push_node(pivot.as_ref().unwrap(), w);
    Some(join_node(left, pivot, rest, w))
}
#[cfg(test)]
mod foundation_tests {
    use super::*;
    use crate::cold_session::model::Shard;
    fn shard(i: usize) -> Shard {
        Shard {
            run_index: i + 7,
            start_offset: i * 2,
            end_offset: i * 2 + 2,
            glyphs: vec![],
            line_breaks: vec![],
            grapheme_boundaries: vec![],
            start_safe: true,
            end_safe: true,
            concat_unsafe: vec![],
        }
    }
    #[test]
    fn foundation_avl_splice_rank_and_child_base_compose_without_payload_rewrites() {
        let original = Tree::build((0..255).map(shard).collect(), &mut Work::default());
        let suffix = original.payload(230);
        let mut w = TreeWork::default();
        let changed = original.splice(
            20,
            21,
            vec![shard(20), shard(21), shard(22)],
            Delta {
                units: 4,
                bytes: 6,
                runs: 2,
            },
            &mut w,
        );
        assert_eq!(changed.len, 257);
        assert_eq!(w.payload_copy_calls, 0);
        assert_eq!(w.position_rewrites, 0);
        assert!(w.copies < 160 && w.visits < 160);
        assert!(Arc::ptr_eq(&suffix, &changed.payload(232)));
        changed.recursive_stats();
        let v = changed.at(232, &mut w).unwrap().materialize(&mut w);
        assert_eq!((v.start_offset, v.end_offset, v.run_index), (464, 466, 239));
        // A structural right child keeps absolute rank membership plus a base.
        let child = changed.slice(
            200,
            250,
            Delta {
                units: -404,
                bytes: -406,
                runs: 0,
            },
            &mut w,
        );
        child.recursive_stats();
        let v = child.at(32, &mut w).unwrap().materialize(&mut w);
        assert_eq!((v.start_offset, v.run_index - 207), (60, 32));
        let restored = changed.splice(
            20,
            23,
            vec![shard(20)],
            Delta {
                units: -4,
                bytes: -6,
                runs: -2,
            },
            &mut w,
        );
        restored.recursive_stats();
        assert!(Arc::ptr_eq(&suffix, &restored.payload(230)));
        for i in 0..255 {
            let v = restored.at(i, &mut w).unwrap().materialize(&mut w);
            assert_eq!(
                (v.start_offset, v.end_offset, v.run_index),
                (i * 2, i * 2 + 2, i + 7)
            );
        }
        // Repeated uneven slicing/splicing catches both double rotations.
        let mut tree = original;
        for i in 0..100 {
            tree = tree.splice(
                i % tree.len,
                (i % tree.len) + 1,
                vec![shard(i), shard(i + 1)],
                Delta::default(),
                &mut w,
            );
            tree.recursive_stats();
        }
        for left in 0..30 {
            for right in [31, 100, tree.len] {
                tree.slice(left, right, Delta::default(), &mut w)
                    .recursive_stats();
            }
        }
    }
    #[test]
    fn foundation_splice_cost_scales_with_height_and_retains_both_sides() {
        for n in [31, 255, 4095] {
            let tree = Tree::build((0..n).map(shard).collect(), &mut Work::default());
            let left = tree.payload(0);
            let right = tree.payload(n - 1);
            let mut w = TreeWork::default();
            let out = tree.splice(
                n / 2,
                n / 2 + 1,
                vec![shard(n / 2), shard(n / 2 + 1)],
                Delta {
                    units: 2,
                    bytes: 2,
                    runs: 1,
                },
                &mut w,
            );
            assert!(w.copies <= 16 * (tree.height + 1) as u64);
            assert!(w.visits <= 16 * (tree.height + 1) as u64);
            assert_eq!((w.payload_copy_calls, w.position_rewrites), (0, 0));
            assert!(Arc::ptr_eq(&left, &out.payload(0)));
            assert!(Arc::ptr_eq(&right, &out.payload(n)));
            out.recursive_stats();
        }
    }
}
