import { RichTextBlock } from './blocks/RichTextBlock'
import { ImageBlock } from './blocks/ImageBlock'
import { QuickLinksBlock } from './blocks/QuickLinksBlock'
import { CollectionListBlock } from './blocks/CollectionListBlock'
import { PanneauPocketBlock } from './blocks/PanneauPocketBlock'

export function RenderBlocks({ blocks }: { blocks?: any[] }) {
  if (!blocks?.length) return null
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.blockType) {
          case 'richText':
            return <RichTextBlock key={index} content={block.content} />
          case 'image':
            return <ImageBlock key={index} image={block.image} caption={block.caption} />
          case 'quickLinks':
            return <QuickLinksBlock key={index} links={block.links} />
          case 'collectionList':
            return (
              <CollectionListBlock
                key={index}
                collection={block.collection}
                limit={block.limit}
                title={block.title}
              />
            )
          case 'panneauPocket':
            return <PanneauPocketBlock key={index} title={block.title} widgetUrl={block.widgetUrl} />
          default:
            return null
        }
      })}
    </>
  )
}
