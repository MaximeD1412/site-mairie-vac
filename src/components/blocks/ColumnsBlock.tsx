import { RenderBlocks } from '../Blocks'

interface Column {
  id?: string
  widthPct: number
  blocks?: any[]
}

interface ColumnsBlockProps {
  columns: Column[]
}

export function ColumnsBlock({ columns }: ColumnsBlockProps) {
  if (!columns.length) return null
  return (
    <div className="my-8 flex gap-4" style={{ flexWrap: 'wrap' }}>
      {columns.map((col, i) => (
        <div
          key={col.id ?? i}
          role="region"
          aria-label={`Colonne ${i + 1}`}
          style={{ flexBasis: `${col.widthPct}%`, flexGrow: 0, flexShrink: 1, minWidth: '200px' }}
        >
          <RenderBlocks blocks={col.blocks} />
        </div>
      ))}
    </div>
  )
}
