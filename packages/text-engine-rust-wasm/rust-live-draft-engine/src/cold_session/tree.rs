use super::ledger::Work;

// Balanced immutable ownership tree, built once from an ordered iterator.
// No parallel retained Vec or materialized snapshot.
pub(super) struct Tree<T> {
    root: Option<Box<Node<T>>>,
    pub len: usize,
    pub height: usize,
}
struct Node<T> {
    value: T,
    left: Option<Box<Node<T>>>,
    right: Option<Box<Node<T>>>,
}
impl<T> Tree<T> {
    pub fn build(values: Vec<T>, work: &mut Work) -> Self {
        let len = values.len();
        fn node<T>(
            iter: &mut std::vec::IntoIter<T>,
            n: usize,
            work: &mut Work,
        ) -> (Option<Box<Node<T>>>, usize) {
            if n == 0 {
                return (None, 0);
            }
            let (left, lh) = node(iter, n / 2, work);
            let value = iter.next().unwrap();
            let (right, rh) = node(iter, n - n / 2 - 1, work);
            work.tree_nodes += 1;
            work.tree_construction_visits += 1;
            (Some(Box::new(Node { value, left, right })), 1 + lh.max(rh))
        }
        let (root, height) = node(&mut values.into_iter(), len, work);
        Self { root, len, height }
    }
    pub fn visit(&self, mut f: impl FnMut(&T)) {
        fn visit<T>(node: &Option<Box<Node<T>>>, f: &mut impl FnMut(&T)) {
            if let Some(n) = node {
                visit(&n.left, f);
                f(&n.value);
                visit(&n.right, f);
            }
        }
        visit(&self.root, &mut f);
    }
}
