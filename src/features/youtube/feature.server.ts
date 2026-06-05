import { createNode, createServerFeature } from '@payloadcms/richtext-lexical'
import { YouTubeNode } from './YoutubeNode'

export const YoutubeFeature = createServerFeature({
  feature() {
    return {
      ClientFeature: '@/features/youtube/feature.client#YoutubeFeatureClient',
      nodes: [
        createNode({
          node: YouTubeNode,
          converters: {
            html: {
              nodeTypes: [YouTubeNode.getType()],
              async converter({ node }) {
                const id = (node as unknown as { id: string }).id
                return `<div><iframe src="https://www.youtube-nocookie.com/embed/${id}?modestbranding=1&rel=0" width="100%" style="aspect-ratio: 16/9" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
              },
            },
          },
        }),
      ],
    }
  },
  key: 'youtube',
})
