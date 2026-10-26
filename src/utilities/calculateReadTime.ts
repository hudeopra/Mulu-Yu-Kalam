/**
 * Recursively extracts plain text from Payload's Lexical JSON editor state.
 */
export function extractTextFromLexical(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.children)) {
    return node.children.map(extractTextFromLexical).join(' ')
  }
  if (node.root) {
    return extractTextFromLexical(node.root)
  }
  return ''
}

/**
 * Calculates estimated reading time in minutes from Lexical content.
 * Standard average reading speed: 200 words per minute.
 * Always returns at least 1 minute.
 */
export function calculateReadTime(content: any): number {
  if (!content) return 1
  const text = extractTextFromLexical(content)
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const wordsPerMinute = 200
  const minutes = Math.ceil(words / wordsPerMinute)
  return Math.max(1, minutes)
}

