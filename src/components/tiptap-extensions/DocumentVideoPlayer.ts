import { Node, mergeAttributes } from '@tiptap/core'

export const DocumentVideoPlayer = Node.create({
  name: 'documentVideoPlayer',
  group: 'block',
  atom: true,
  content: 'inline*',

  addAttributes() {
    return {
      src: { default: null },
      mimeType: { default: 'video/mp4' },
    }
  },

  parseHTML() {
    return [{ tag: 'video.video-player' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes({ class: 'video-player', controls: 'true', style: 'width:100%;' }),
      ['source', { src: HTMLAttributes.src, type: HTMLAttributes.mimeType }],
    ]
  },
})
