'use client'

import { createClientFeature, toolbarAddDropdownGroupWithItems } from '@payloadcms/richtext-lexical/client'
import {
  $getPreviousSelection,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from '@payloadcms/richtext-lexical/lexical'
import { $insertNodeToNearestRoot } from '@payloadcms/richtext-lexical/lexical/utils'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import React, { useEffect, useRef } from 'react'
import { $createYouTubeNode, $isYouTubeNode, YouTubeNode } from './YoutubeNode'

const INSERT_YOUTUBE = createCommand<{ replace: boolean }>('INSERT_YOUTUBE_EMBED')

function extractYouTubeId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) return match[1]
  }
  return null
}

const YouTubeIcon = () =>
  React.createElement(
    'svg',
    {
      role: 'img',
      viewBox: '0 0 24 24',
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'currentColor',
      width: '16',
      height: '16',
    },
    React.createElement('title', null, 'YouTube'),
    React.createElement('path', {
      d: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    }),
  )

const YoutubePlugin = () => {
  const [editor] = useLexicalComposerContext()
  const savedSelectionRef = useRef<ReturnType<typeof $getSelection>>(null)

  useEffect(() => {
    return editor.registerCommand(
      INSERT_YOUTUBE,
      () => {
        editor.read(() => {
          savedSelectionRef.current = $getSelection() ?? $getPreviousSelection()
        })

        const input = window.prompt('URL ou ID de la vidéo YouTube :')
        if (!input) return true

        const videoId = extractYouTubeId(input.trim())
        if (!videoId) {
          window.alert('URL YouTube invalide.')
          return true
        }

        editor.update(() => {
          const selection = savedSelectionRef.current
          if (selection) $setSelection(selection.clone())
          if ($isRangeSelection(selection)) {
            $insertNodeToNearestRoot($createYouTubeNode(videoId))
          }
        })

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}

const youtubeToolbarGroup = toolbarAddDropdownGroupWithItems([
  {
    ChildComponent: YouTubeIcon,
    isActive: ({ selection }) => {
      if (!$isNodeSelection(selection) || !selection.getNodes().length) return false
      return $isYouTubeNode(selection.getNodes()[0])
    },
    key: 'youtube',
    label: 'Youtube',
    onSelect: ({ editor }) => {
      editor.dispatchCommand(INSERT_YOUTUBE, { replace: false })
    },
  },
])

export const YoutubeFeatureClient = createClientFeature(() => ({
  plugins: [{ Component: YoutubePlugin, position: 'normal' }],
  nodes: [YouTubeNode],
  toolbarFixed: { groups: [youtubeToolbarGroup] },
  toolbarInline: { groups: [youtubeToolbarGroup] },
}))
