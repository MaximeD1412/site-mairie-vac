'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import sanitizeHtml from 'sanitize-html'
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2 } from 'lucide-react'

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  className?: string
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'em', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
  },
  allowedSchemes: ['https', 'http', 'mailto'],
}

export function RichEditor({ value, onChange, className }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false }),
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
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[8rem] border border-t-0 border-[var(--color-border)] rounded-b-md p-3 focus-within:outline-2 focus-within:outline-[var(--color-teal)]"
      />
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
