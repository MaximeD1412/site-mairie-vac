'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import sanitizeHtml from 'sanitize-html'
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, ImageIcon, FileText } from 'lucide-react'
import { MediaLibraryModal } from './MediaLibraryModal'
import { DocumentLibraryModal, type DocumentInsertMode } from './DocumentLibraryModal'
import { DocumentPdfViewer } from './tiptap-extensions/DocumentPdfViewer'
import { DocumentVideoPlayer } from './tiptap-extensions/DocumentVideoPlayer'

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  className?: string
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'em', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img', 'iframe', 'video', 'source'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    iframe: ['src', 'title', 'allowfullscreen', 'class', 'style'],
    video: ['controls', 'class', 'style'],
    source: ['src', 'type'],
  },
  allowedSchemes: ['https', 'http', 'mailto'],
}

export function RichEditor({ value, onChange, className }: RichEditorProps) {
  const [mediaOpen, setMediaOpen] = useState(false)
  const [docOpen, setDocOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      DocumentPdfViewer,
      DocumentVideoPlayer,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(sanitizeHtml(editor.getHTML(), SANITIZE_OPTIONS))
    },
  })

  const handleLinkToggle = () => {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
    } else {
      const url = window.prompt('URL du lien')
      if (url) editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const handleImageSelect = (url: string, alt: string) => {
    editor?.chain().focus().setImage({ src: url, alt }).run()
    setMediaOpen(false)
  }

  const handleDocumentInsert = (mode: DocumentInsertMode) => {
    if (!editor) return
    if (mode.type === 'link') {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${mode.href}" target="_blank" rel="noopener noreferrer">${mode.label}</a>`)
        .run()
    } else if (mode.type === 'pdf-viewer') {
      editor.chain().focus().insertContent({ type: 'documentPdfViewer', attrs: { src: mode.src, title: mode.title } }).run()
    } else if (mode.type === 'video') {
      editor
        .chain()
        .focus()
        .insertContent({ type: 'documentVideoPlayer', attrs: { src: mode.src, mimeType: mode.mimeType } })
        .run()
    }
    setDocOpen(false)
  }

  return (
    <div className={className}>
      <div role="toolbar" aria-label="Barre de mise en forme" className="flex flex-wrap gap-1 p-2 border border-[var(--color-border)] rounded-t-md bg-[var(--color-brand-pale)]">
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          aria-label="Gras"
          aria-pressed={editor?.isActive('bold') ?? false}
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          aria-label="Italique"
          aria-pressed={editor?.isActive('italic') ?? false}
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Titre H2"
          aria-pressed={editor?.isActive('heading', { level: 2 }) ?? false}
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-label="Titre H3"
          aria-pressed={editor?.isActive('heading', { level: 3 }) ?? false}
        >
          <Heading3 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          aria-label="Liste à puces"
          aria-pressed={editor?.isActive('bulletList') ?? false}
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          aria-label="Liste numérotée"
          aria-pressed={editor?.isActive('orderedList') ?? false}
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleLinkToggle}
          aria-label="Lien"
          aria-pressed={editor?.isActive('link') ?? false}
        >
          <Link2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setMediaOpen(true)}
          aria-label="Image"
          aria-pressed={false}
        >
          <ImageIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setDocOpen(true)}
          aria-label="Document"
          aria-pressed={false}
        >
          <FileText size={15} />
        </ToolbarButton>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[8rem] border border-t-0 border-[var(--color-border)] rounded-b-md p-3 focus-within:outline-2 focus-within:outline-[var(--color-teal)]"
      />
      {mediaOpen && (
        <MediaLibraryModal
          onSelect={handleImageSelect}
          onClose={() => setMediaOpen(false)}
        />
      )}
      {docOpen && (
        <DocumentLibraryModal
          onInsert={handleDocumentInsert}
          onClose={() => setDocOpen(false)}
        />
      )}
    </div>
  )
}

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
  'aria-pressed': boolean
  children: React.ReactNode
}

function ToolbarButton({ children, 'aria-pressed': pressed, ...props }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={[
        'p-1.5 rounded text-sm transition-colors',
        'hover:bg-[var(--color-brand-light)] hover:text-white',
        'focus-visible:outline-2 focus-visible:outline-[var(--color-teal)]',
        pressed ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-text)]',
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
