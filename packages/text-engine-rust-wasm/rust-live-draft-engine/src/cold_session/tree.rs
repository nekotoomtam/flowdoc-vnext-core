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
    // Persistent AVL tail insertion. Push lazy coordinates into descriptor
    // offsets/child roots only; retained payloads are never materialized.
    pub fn append(&self, value: T, w: &mut TreeWork) -> Self {
        fn size<T>(n: &Option<Arc<Node<T>>>) -> usize { n.as_ref().map_or(0, |v| v.count) }
        fn height<T>(n: &Option<Arc<Node<T>>>) -> usize { n.as_ref().map_or(0, |v| v.height) }
        fn refresh<T>(n: &mut Node<T>) { n.count=1+size(&n.left)+size(&n.right); n.height=1+height(&n.left).max(height(&n.right)); }
        fn push<T>(n: &Arc<Node<T>>, w: &mut TreeWork) -> Node<T> {
            w.visits+=1; w.copies+=1;
            let mut c=(**n).clone(); let d=c.shift;
            c.value_shift=c.value_shift.plus(d); c.shift=Delta::default();
            for child in [&mut c.left,&mut c.right] {
                if let Some(old)=child { w.shared_subtrees+=1;
                    if d.units!=0 || d.bytes!=0 {let mut v=(**old).clone();v.shift=v.shift.plus(d);w.copies+=1;w.shifted_subtrees+=1;*old=Arc::new(v);}
                }
            }
            c
        }
        fn insert<T>(node: &Option<Arc<Node<T>>>, value: Arc<T>, w: &mut TreeWork) -> Arc<Node<T>> {
            let Some(node)=node else {w.copies+=1;return Arc::new(Node{value,left:None,right:None,count:1,height:1,shift:Delta::default(),value_shift:Delta::default()});};
            let mut c=push(node,w); c.right=Some(insert(&c.right,value,w)); refresh(&mut c);
            if height(&c.right)>height(&c.left)+1 {
                // Tail insertion only grows the right spine; one left rotation.
                let mut r=push(c.right.as_ref().unwrap(),w);c.right=r.left.take();refresh(&mut c);
                r.left=Some(Arc::new(c));refresh(&mut r);Arc::new(r)
            } else {Arc::new(c)}
        }
        let root=Some(insert(&self.root,Arc::new(value),w));
        Self{len:self.len+1,height:root.as_ref().unwrap().height,root}
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
    // Rank slicing visits only the two boundary paths. Retained subtrees keep
    // their lazy coordinates; no suffix payload is materialized or relabelled.
    pub fn slice(&self, start: usize, end: usize, delta: Delta, w: &mut TreeWork) -> Self {
        fn walk<T>(n: &Option<Arc<Node<T>>>, a: usize, b: usize, inherited: Delta, w: &mut TreeWork) -> Option<Arc<Node<T>>> {
            if a == b { return None; }
            let node = n.as_ref().unwrap();
            w.visits += 1;
            let shift = inherited.plus(node.shift);
            if a == 0 && b == node.count {
                let mut copy = (**node).clone();
                copy.shift = shift;
                w.copies += 1;
                w.shared_subtrees += 1;
                w.shifted_subtrees += 1;
                return Some(Arc::new(copy));
            }
            let left = node.left.as_ref().map_or(0, |v| v.count);
            if b <= left { return walk(&node.left, a, b, shift, w); }
            if a > left { return walk(&node.right, a-left-1, b-left-1, shift, w); }
            let mut copy = (**node).clone();
            copy.shift = shift;
            copy.left = walk(&node.left, a.min(left), b.min(left), Delta::default(), w);
            copy.right = walk(&node.right, a.saturating_sub(left+1), b.saturating_sub(left+1), Delta::default(), w);
            copy.count = b-a;
            copy.height = 1 + copy.left.as_ref().map_or(0, |v|v.height).max(copy.right.as_ref().map_or(0, |v|v.height));
            w.copies += 1;
            Some(Arc::new(copy))
        }
        assert!(start <= end && end <= self.len);
        let root = walk(&self.root, start, end, delta, w);
        Self { len: end-start, height: root.as_ref().map_or(0, |v|v.height), root }
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
        fn remove<T>(n: &Arc<Node<T>>, w: &mut TreeWork) -> Option<Arc<Node<T>>> {
            w.visits += 1;
            if let Some(right) = &n.right {
                let mut c = (**n).clone();
                c.right = remove(right, w);
                c.count -= 1;
                c.height = 1 + c
                    .left
                    .as_ref()
                    .map_or(0, |n| n.height)
                    .max(c.right.as_ref().map_or(0, |n| n.height));
                w.copies += 1;
                if c.left.is_some() {
                    w.shared_subtrees += 1;
                }
                Some(Arc::new(c))
            } else {
                n.left.as_ref().map(|left| {
                    let mut c = (**left).clone();
                    c.shift = c.shift.plus(n.shift);
                    w.copies += 1;
                    w.shifted_subtrees += 1;
                    w.shared_subtrees += 1;
                    Arc::new(c)
                })
            }
        }
        let root = self.root.as_ref().and_then(|n| remove(n, w));
        Self {
            len: root.as_ref().map_or(0, |n| n.count),
            height: root.as_ref().map_or(0, |n| n.height),
            root,
        }
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
    #[cfg(test)]
    pub fn payload(&self, index: usize) -> Arc<T> {
        self.at(index, &mut TreeWork::default()).unwrap().value
    }
}
