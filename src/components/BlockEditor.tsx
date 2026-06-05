'use client'

import React, { useState, useRef } from 'react'
import { nanoid } from 'nanoid'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Image as ImageIcon, Video, Type, Columns } from 'lucide-react'
import { RichEditor } from './RichEditor'
import { MediaLibraryModal } from './MediaLibraryModal'

export type RichTextBlock = { id: string; type: 'richText'; html: string }
export type ImageBlock = { id: string; type: 'image'; url: string; alt: string; caption: string }
export type VideoBlock = { id: string; type: 'video'; src: string; isEmbed: boolean }
export type LeafBlock = RichTextBlock | ImageBlock | VideoBlock

export type ColumnDef = {
  id: string
  widthPct: number
  blocks: LeafBlock[]
}

export type ColumnsBlock = {
  id: string
  type: 'columns'
  columns: ColumnDef[]
}

export type Block = RichTextBlock | ImageBlock | VideoBlock | ColumnsBlock

/** Snap column widths to standard ratios. For 2 columns: [25/75,33/67,50/50,67/33,75/25]. For N: nearest multiple of 5, sum=100. */
export function snapColumnWidths(widths: number[]): number[] {
  if (widths.length === 2) {
    const snapPoints = [25, 33, 50, 67, 75]
    const left = widths[0]
    const snapped = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - left) < Math.abs(prev - left) ? curr : prev,
    )
    return [snapped, 100 - snapped]
  }
  const snapped = widths.map((w) => Math.round(w / 5) * 5)
  const total = snapped.reduce((s, v) => s + v, 0)
  const result = [...snapped]
  result[result.length - 1] += 100 - total
  return result
}

function redistributeWidths(cols: ColumnDef[]): ColumnDef[] {
  const n = cols.length
  const equal = Math.floor(100 / n)
  const remainder = 100 - equal * n
  return cols.map((c, i) => ({ ...c, widthPct: equal + (i === n - 1 ? remainder : 0) }))
}

interface BlockEditorProps {
  value: Block[]
  onChange: (blocks: Block[]) => void
}

export function BlockEditor({ value, onChange }: BlockEditorProps) {
  const [mediaPickTarget, setMediaPickTarget] = useState<'add' | string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = value.findIndex((b) => b.id === active.id)
    const newIndex = value.findIndex((b) => b.id === over.id)
    onChange(arrayMove(value, oldIndex, newIndex))
  }

  const addRichText = () => {
    onChange([...value, { id: nanoid(), type: 'richText', html: '' }])
  }

  const addVideo = () => {
    onChange([...value, { id: nanoid(), type: 'video', src: '', isEmbed: false }])
  }

  const addColumns = () => {
    onChange([
      ...value,
      {
        id: nanoid(),
        type: 'columns',
        columns: [
          { id: nanoid(), widthPct: 50, blocks: [] },
          { id: nanoid(), widthPct: 50, blocks: [] },
        ],
      },
    ])
  }

  const handleImageSelected = (url: string, alt: string) => {
    onChange([...value, { id: nanoid(), type: 'image', url, alt, caption: '' }])
    setMediaPickTarget(null)
  }

  const deleteBlock = (id: string) => {
    onChange(value.filter((b) => b.id !== id))
  }

  const updateBlock = (id: string, patch: Partial<Block>) => {
    onChange(value.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)))
  }

  return (
    <section aria-label="Éditeur de blocs" className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {value.map((block) => (
            <SortableBlock key={block.id} block={block} onDelete={deleteBlock} onUpdate={updateBlock} />
          ))}
        </SortableContext>
      </DndContext>

      <div role="toolbar" aria-label="Ajouter un bloc" className="flex flex-wrap gap-2 pt-2">
        <AddButton onClick={addRichText} icon={<Type size={14} />} label="+ Texte" />
        <AddButton onClick={() => setMediaPickTarget('add')} icon={<ImageIcon size={14} />} label="+ Image" />
        <AddButton onClick={addVideo} icon={<Video size={14} />} label="+ Vidéo" />
        <AddButton onClick={addColumns} icon={<Columns size={14} />} label="+ Colonnes" />
      </div>

      {mediaPickTarget === 'add' && (
        <MediaLibraryModal
          onSelect={handleImageSelected}
          onClose={() => setMediaPickTarget(null)}
        />
      )}
    </section>
  )
}

interface SortableBlockProps {
  block: Block
  onDelete: (id: string) => void
  onUpdate: (id: string, patch: Partial<Block>) => void
}

function SortableBlock({ block, onDelete, onUpdate }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-2 items-start rounded-lg border border-[var(--color-border)] bg-white p-3"
    >
      <button
        type="button"
        aria-label="Déplacer le bloc"
        className="mt-1 shrink-0 cursor-grab text-slate-400 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-[var(--color-teal)]"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>

      <div className="min-w-0 flex-1">
        <BlockContent block={block} onUpdate={onUpdate} />
      </div>

      <button
        type="button"
        aria-label="Supprimer le bloc"
        onClick={() => onDelete(block.id)}
        className="mt-1 shrink-0 text-slate-400 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-[var(--color-teal)]"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

function BlockContent({
  block,
  onUpdate,
}: {
  block: Block
  onUpdate: (id: string, patch: Partial<Block>) => void
}) {
  if (block.type === 'richText') {
    return (
      <RichEditor
        value={block.html}
        onChange={(html) => onUpdate(block.id, { html })}
      />
    )
  }

  if (block.type === 'image') {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.url}
            alt={block.alt}
            className="h-20 w-auto rounded border border-[var(--color-border)] object-cover"
          />
          <div className="min-w-0 flex-1 text-sm text-slate-500 truncate">{block.url}</div>
        </div>
        <div>
          <label htmlFor={`caption-${block.id}`} className="block text-xs font-medium text-slate-600">
            Légende
          </label>
          <input
            id={`caption-${block.id}`}
            type="text"
            value={block.caption}
            onChange={(e) => onUpdate(block.id, { caption: e.target.value })}
            placeholder="Légende optionnelle…"
            className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-[var(--color-teal)] focus:outline-none"
          />
        </div>
      </div>
    )
  }

  if (block.type === 'video') {
    return (
      <div>
        <label htmlFor={`video-${block.id}`} className="block text-xs font-medium text-slate-600">
          URL de la vidéo
        </label>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
          <Video size={12} />
          {block.src ? <span className="truncate">{block.src}</span> : <span className="italic">Aucune URL</span>}
        </div>
        <input
          id={`video-${block.id}`}
          type="url"
          value={block.src}
          onChange={(e) => onUpdate(block.id, { src: e.target.value, isEmbed: e.target.value.includes('youtu') })}
          placeholder="https://youtube.com/watch?v=… ou URL médiathèque"
          aria-label="URL de la vidéo"
          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-[var(--color-teal)] focus:outline-none"
        />
      </div>
    )
  }

  if (block.type === 'columns') {
    return <ColumnsBlockEditor block={block} onUpdate={onUpdate} />
  }

  return null
}

function ColumnsBlockEditor({
  block,
  onUpdate,
}: {
  block: ColumnsBlock
  onUpdate: (id: string, patch: Partial<Block>) => void
}) {
  const [colMediaPick, setColMediaPick] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const setColumns = (columns: ColumnDef[]) => {
    onUpdate(block.id, { columns } as Partial<ColumnsBlock>)
  }

  const addColumn = () => {
    const newCol: ColumnDef = { id: nanoid(), widthPct: 0, blocks: [] }
    setColumns(redistributeWidths([...block.columns, newCol]))
  }

  const deleteColumn = (colId: string) => {
    const col = block.columns.find((c) => c.id === colId)!
    if (col.blocks.length > 0) {
      if (!window.confirm('Cette colonne contient des blocs. Supprimer quand même ?')) return
    }
    const remaining = block.columns.filter((c) => c.id !== colId)
    setColumns(redistributeWidths(remaining))
  }

  const addLeafBlock = (colId: string, leaf: LeafBlock) => {
    setColumns(block.columns.map((c) => (c.id === colId ? { ...c, blocks: [...c.blocks, leaf] } : c)))
  }

  const deleteLeafBlock = (colId: string, leafId: string) => {
    setColumns(
      block.columns.map((c) =>
        c.id === colId ? { ...c, blocks: c.blocks.filter((b) => b.id !== leafId) } : c,
      ),
    )
  }

  const updateLeafBlock = (colId: string, leafId: string, patch: Partial<Block>) => {
    setColumns(
      block.columns.map((c) =>
        c.id === colId
          ? { ...c, blocks: c.blocks.map((b) => (b.id === leafId ? ({ ...b, ...patch } as LeafBlock) : b)) }
          : c,
      ),
    )
  }

  const handleResizeStart = (idx: number, e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return
    const containerWidth = container.getBoundingClientRect().width || 1
    const startX = e.clientX
    const startWidths = block.columns.map((c) => c.widthPct)

    const onMove = (ev: PointerEvent) => {
      const delta = ((ev.clientX - startX) / containerWidth) * 100
      const raw = [...startWidths]
      raw[idx] = Math.max(10, Math.min(90, startWidths[idx] + delta))
      raw[idx + 1] = Math.max(10, Math.min(90, startWidths[idx + 1] - delta))
      const snapped = snapColumnWidths(raw)
      setColumns(block.columns.map((c, i) => ({ ...c, widthPct: snapped[i] })))
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div>
      <div ref={containerRef} className="flex flex-wrap">
        {block.columns.map((col, idx) => (
          <React.Fragment key={col.id}>
            <section
              aria-label={`Colonne ${idx + 1}`}
              style={{ width: `${col.widthPct}%` }}
              className="min-w-0 p-2 border border-dashed border-slate-200"
            >
              <div className="space-y-1 mb-2">
                {col.blocks.map((leaf) => (
                  <div
                    key={leaf.id}
                    className="flex gap-1 items-start rounded border border-[var(--color-border)] bg-white p-2"
                  >
                    <div className="min-w-0 flex-1">
                      <BlockContent block={leaf} onUpdate={(id, patch) => updateLeafBlock(col.id, id, patch)} />
                    </div>
                    <button
                      type="button"
                      aria-label="Supprimer le bloc"
                      onClick={() => deleteLeafBlock(col.id, leaf.id)}
                      className="shrink-0 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div
                role="toolbar"
                aria-label={`Ajouter un bloc dans la colonne ${idx + 1}`}
                className="flex flex-wrap gap-1"
              >
                <AddButton
                  onClick={() => addLeafBlock(col.id, { id: nanoid(), type: 'richText', html: '' })}
                  icon={<Type size={12} />}
                  label="+ Texte"
                />
                <AddButton
                  onClick={() => setColMediaPick(col.id)}
                  icon={<ImageIcon size={12} />}
                  label="+ Image"
                />
                <AddButton
                  onClick={() => addLeafBlock(col.id, { id: nanoid(), type: 'video', src: '', isEmbed: false })}
                  icon={<Video size={12} />}
                  label="+ Vidéo"
                />
              </div>

              <button
                type="button"
                aria-label="Supprimer la colonne"
                onClick={() => deleteColumn(col.id)}
                className="mt-1 text-xs text-slate-400 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-[var(--color-teal)]"
              >
                − Colonne
              </button>
            </section>

            {idx < block.columns.length - 1 && (
              <div
                role="separator"
                aria-label="Redimensionner les colonnes"
                className="w-2 cursor-col-resize bg-slate-100 hover:bg-slate-300 flex-shrink-0 self-stretch"
                onPointerDown={(e) => handleResizeStart(idx, e)}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        type="button"
        aria-label="Ajouter une colonne"
        onClick={addColumn}
        className="mt-2 text-xs text-slate-400 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-[var(--color-teal)]"
      >
        + Colonne
      </button>

      {colMediaPick && (
        <MediaLibraryModal
          onSelect={(url, alt) => {
            addLeafBlock(colMediaPick, { id: nanoid(), type: 'image', url, alt, caption: '' })
            setColMediaPick(null)
          }}
          onClose={() => setColMediaPick(null)}
        />
      )}
    </div>
  )
}

function AddButton({
  onClick,
  icon,
  label,
  disabled = false,
}: {
  onClick?: () => void
  icon: React.ReactNode
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex items-center gap-1.5 rounded border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-[var(--color-teal)]"
    >
      {icon}
      {label}
    </button>
  )
}
