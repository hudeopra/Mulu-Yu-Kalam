export type TOCItem = {
  id: string
  text: string
  level: 'h2' | 'h3'
}

/**
 * Recursively extracts plain text from Lexical AST nodes
 */
export function extractTextFromNode(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.children)) {
    return node.children.map(extractTextFromNode).join('')
  }
  return ''
}

/**
 * Converts heading text to a URL-friendly anchor ID
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Extracts h2 and h3 headings from Lexical RichText JSON content
 */
export function extractHeadings(content: any): TOCItem[] {
  if (!content?.root?.children || !Array.isArray(content.root.children)) {
    return []
  }

  const headings: TOCItem[] = []
  const usedSlugs = new Map<string, number>()

  function traverse(nodes: any[]) {
    for (const node of nodes) {
      if (node.type === 'heading' && (node.tag === 'h2' || node.tag === 'h3')) {
        const rawText = extractTextFromNode(node).trim()
        if (rawText) {
          let baseSlug = slugifyHeading(rawText) || 'heading'
          const count = usedSlugs.get(baseSlug) || 0
          usedSlugs.set(baseSlug, count + 1)

          const id = count === 0 ? baseSlug : `${baseSlug}-${count}`

          headings.push({
            id,
            text: rawText,
            level: node.tag as 'h2' | 'h3',
          })
        }
      }

      if (Array.isArray(node.children)) {
        traverse(node.children)
      }
    }
  }

  traverse(content.root.children)
  return headings
}

