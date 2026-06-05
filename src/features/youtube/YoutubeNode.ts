import { DecoratorBlockNode } from '@payloadcms/richtext-lexical/lexical/react/LexicalDecoratorBlockNode'
import type {
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from '@payloadcms/richtext-lexical/lexical'
import React from 'react'

export type SerializedYouTubeNode = Spread<
  { id: string; type: 'youtube'; version: 1; format: ElementFormatType },
  SerializedLexicalNode
>

export class YouTubeNode extends DecoratorBlockNode {
  __id: string

  static getType(): string {
    return 'youtube'
  }

  static clone(node: YouTubeNode): YouTubeNode {
    return new YouTubeNode(node.__id, node.__format, node.__key)
  }

  static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
    const node = new YouTubeNode(serializedNode.id)
    node.setFormat(serializedNode.format)
    return node
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key)
    this.__id = id
  }

  getId(): string {
    return this.__id
  }

  exportJSON(): SerializedYouTubeNode {
    return {
      ...super.exportJSON(),
      type: 'youtube',
      version: 1,
      id: this.__id,
    }
  }

  exportDOM(): { element: HTMLElement } {
    const element = document.createElement('iframe')
    element.style.aspectRatio = '16/9'
    element.setAttribute('data-lexical-youtube', this.__id)
    element.setAttribute('width', '100%')
    element.setAttribute('src', `https://www.youtube-nocookie.com/embed/${this.__id}`)
    element.setAttribute('frameborder', '0')
    element.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    )
    element.setAttribute('allowfullscreen', 'true')
    return { element }
  }

  static importDOM() {
    return {
      iframe: (domNode: HTMLElement) => {
        const src = domNode.getAttribute('src') || domNode.getAttribute('data-src')
        const match = src?.match(/youtube(-nocookie)?\.com\/embed\/([^?]+)/)
        if (match && match[2]) {
          return {
            conversion: () => ({ node: new YouTubeNode(match[2]) }),
            priority: 1 as const,
          }
        }
        return null
      },
    }
  }

  getTextContent(): string {
    return `https://www.youtube.com/watch?v=${this.__id}`
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): React.ReactElement {
    return React.createElement(
      'div',
      null,
      React.createElement('iframe', {
        width: '100%',
        src: `https://www.youtube-nocookie.com/embed/${this.__id}?modestbranding=1&rel=0`,
        allow:
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowFullScreen: true,
        style: { aspectRatio: '16/9' },
        title: 'Lecture vidéo',
      }),
    )
  }
}

export function $createYouTubeNode(videoID: string): YouTubeNode {
  return new YouTubeNode(videoID)
}

export function $isYouTubeNode(node: unknown): node is YouTubeNode {
  return node instanceof YouTubeNode
}
