'use client'

import { useState } from 'react'
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
export type Block = RichTextBlock | ImageBlock | VideoBlock

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

  const handleImageSelected = (url: string, alt: string) => {
    onChange([...value, { id: nanoid(), type: 'image', url, alt, caption: '' }])
    setMediaPickTarget(null)
  }

  const deleteBlock = (id: string) => {
    onChange(value.filter((b) => b.id !== id))
  }

  const updateBlock = (id: string, patch: Partial<Block>) => {
    onChange(value.map((b) => (b.id === id ? { ...b, ...patch } as Block : b)))
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
        <AddButton disabled icon={<Columns size={14} />} label="+ Colonnes" />
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

function BlockContent({ block, onUpdate }: { block: Block; onUpdate: (id: string, patch: Partial<Block>) => void }) {
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
