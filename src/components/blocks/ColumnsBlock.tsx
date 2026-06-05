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
    <div
      className="my-8 grid gap-4"
      style={{ gridTemplateColumns: columns.map((c) => `${c.widthPct}fr`).join(' ') }}
    >
      {columns.map((col, i) => (
        <div
          key={col.id ?? i}
          role="region"
          aria-label={`Colonne ${i + 1}`}
        >
          <RenderBlocks blocks={col.blocks} />
        </div>
      ))}
    </div>
  )
}
