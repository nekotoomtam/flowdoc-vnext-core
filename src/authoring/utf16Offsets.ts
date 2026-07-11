export function isVNextSafeUtf16TextOffset(text: string, offset: number): boolean {
  if (!Number.isInteger(offset) || offset < 0 || offset > text.length) return false
  if (offset === 0 || offset === text.length) return true

  const previous = text.charCodeAt(offset - 1)
  const current = text.charCodeAt(offset)
  return !(previous >= 0xD800 && previous <= 0xDBFF && current >= 0xDC00 && current <= 0xDFFF)
}
