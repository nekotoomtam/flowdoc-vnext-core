function requirePositiveSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive safe integer`)
  }
}

export function partitionVNextTextBlockPersistentValuesKernelV1<T>(
  values: readonly T[],
  maximumValues: number,
): readonly (readonly T[])[] {
  requirePositiveSafeInteger(maximumValues, "maximumValues")
  if (values.length === 0) return []
  const groupCount = Math.ceil(values.length / maximumValues)
  const baseSize = Math.floor(values.length / groupCount)
  const remainder = values.length % groupCount
  const groups: T[][] = []
  let cursor = 0
  for (let index = 0; index < groupCount; index += 1) {
    const size = baseSize + (index < remainder ? 1 : 0)
    groups.push(values.slice(cursor, cursor + size))
    cursor += size
  }
  return groups
}

export function buildVNextTextBlockPersistentRopeRootKernelV1<TNode>(input: {
  leaves: readonly TNode[]
  maximumBranchChildren: number
  createBranch(children: readonly TNode[]): TNode
}): TNode {
  if (input.leaves.length === 0) {
    throw new RangeError("persistent rope requires at least one leaf")
  }
  requirePositiveSafeInteger(input.maximumBranchChildren, "maximumBranchChildren")
  if (input.maximumBranchChildren < 2) {
    throw new RangeError("maximumBranchChildren must be at least two")
  }
  let current: readonly TNode[] = input.leaves
  while (current.length > 1) {
    current = partitionVNextTextBlockPersistentValuesKernelV1(
      current,
      input.maximumBranchChildren,
    ).map(input.createBranch)
  }
  return current[0]!
}

export function countVNextTextBlockPersistentRopeNodesKernelV1<TNode>(input: {
  root: TNode
  children(node: TNode): readonly TNode[]
}): number {
  let count = 0
  const pending = [input.root]
  while (pending.length > 0) {
    const node = pending.pop()!
    count += 1
    if (!Number.isSafeInteger(count)) {
      throw new RangeError("persistent rope node count exceeded safe integer arithmetic")
    }
    pending.push(...input.children(node))
  }
  return count
}

export function collectVNextTextBlockPersistentRopeNodesKernelV1<TNode>(input: {
  root: TNode
  children(node: TNode): readonly TNode[]
}): readonly TNode[] {
  const nodes: TNode[] = []
  const pending = [input.root]
  while (pending.length > 0) {
    const node = pending.pop()!
    nodes.push(node)
    const children = input.children(node)
    for (let index = children.length - 1; index >= 0; index -= 1) {
      pending.push(children[index]!)
    }
  }
  return nodes
}
