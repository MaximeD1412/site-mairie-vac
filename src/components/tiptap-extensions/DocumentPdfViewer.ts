import { Node, mergeAttributes } from '@tiptap/core'

export const DocumentPdfViewer = Node.create({
  name: 'documentPdfViewer',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'iframe.pdf-viewer' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'iframe',
      mergeAttributes(
        { class: 'pdf-viewer', allowfullscreen: 'true', style: 'width:100%;height:500px;border:none;' },
        { src: HTMLAttributes.src, title: HTMLAttributes.title },
      ),
    ]
  },
})
