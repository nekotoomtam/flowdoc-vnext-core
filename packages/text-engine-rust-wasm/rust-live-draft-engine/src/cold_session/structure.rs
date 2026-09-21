use serde::Serialize;
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct TreeStats {
    pub node_count: usize,
    pub height: usize,
}
impl TreeStats {
    fn bounded(self) -> bool {
        if self.node_count == 0 {
            return self.height == 0;
        }
        // ceil(log2(n+1)) == bit_length(n), without overflowing n+1.
        self.height > 0
            && self.height <= 2 * (usize::BITS - self.node_count.leading_zeros()) as usize
    }
    fn max(self, next: Self) -> Self {
        Self {
            node_count: self.node_count.max(next.node_count),
            height: self.height.max(next.height),
        }
    }
}
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize)]
pub(super) struct Structures {
    pub source: TreeStats,
    pub spans: TreeStats,
    pub runs: TreeStats,
    pub shards: TreeStats,
}
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize)]
pub(super) struct StructuralHistory {
    pub current: Structures,
    pub max: Structures,
}
impl StructuralHistory {
    pub fn initial(current: Structures) -> Self {
        Self {
            current,
            max: current,
        }
    }
    pub fn next(self, current: Structures) -> Result<Self, &'static str> {
        if ![current.source, current.spans, current.runs, current.shards]
            .iter()
            .all(|s| s.bounded())
        {
            return Err("structural-height-limit");
        }
        Ok(Self {
            current,
            max: Structures {
                source: self.max.source.max(current.source),
                spans: self.max.spans.max(current.spans),
                runs: self.max.runs.max(current.runs),
                shards: self.max.shards.max(current.shards),
            },
        })
    }
}
