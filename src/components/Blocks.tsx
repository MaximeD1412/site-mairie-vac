import { RichTextBlock } from './blocks/RichTextBlock'
import { ImageBlock } from './blocks/ImageBlock'
import { QuickLinksBlock } from './blocks/QuickLinksBlock'
import { CollectionListBlock } from './blocks/CollectionListBlock'
import { PanneauPocketBlock } from './blocks/PanneauPocketBlock'
import { ContactBlock } from './blocks/ContactBlock'
import { GalleryBlock } from './blocks/GalleryBlock'
import { AccordionBlock } from './blocks/AccordionBlock'
import { MapBlock } from './blocks/MapBlock'
import { ButtonBlock } from './blocks/ButtonBlock'
import { ColumnsBlock } from './blocks/ColumnsBlock'
import { HtmlContent } from './HtmlContent'

export function RenderBlocks({ blocks }: { blocks?: any[] }) {
  if (!blocks?.length) return null
  return (
    <>
      {blocks.map((block, index) => {
        const discriminator = block.blockType ?? block.type
        switch (discriminator) {
          case 'richText':
            if ('html' in block)
              return <HtmlContent key={index} html={block.html} className="rich-content my-8 text-text text-[15px]" />
            return <RichTextBlock key={index} content={block.content} />
          case 'image':
            if (typeof block.url === 'string')
              return <ImageBlock key={index} image={{ url: block.url, alt: block.alt }} caption={block.caption} />
            return <ImageBlock key={index} image={block.image} caption={block.caption} />
          case 'video':
            if (block.isEmbed)
              return (
                <div key={index} className="my-6 aspect-video w-full overflow-hidden rounded-xl">
                  <iframe src={block.src} title="Vidéo" allowFullScreen className="w-full h-full" />
                </div>
              )
            return (
              <video key={index} controls className="my-6 w-full rounded-xl bg-black">
                <source src={block.src} />
              </video>
            )
          case 'columns':
            return <ColumnsBlock key={index} columns={block.columns} />
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
          case 'contact':
            return <ContactBlock key={index} title={block.title} />
          case 'gallery':
            return <GalleryBlock key={index} images={block.images} />
          case 'accordion':
            return <AccordionBlock key={index} items={block.items} />
          case 'map':
            return <MapBlock key={index} title={block.title} address={block.address} lat={block.lat} lng={block.lng} />
          case 'button':
            return <ButtonBlock key={index} text={block.text} url={block.url} variant={block.variant} />
          default:
            return null
        }
      })}
    </>
  )
}
