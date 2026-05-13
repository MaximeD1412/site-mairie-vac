import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

export async function RenderBlocks({ blocks }: { blocks?: any[] }) {
  if (!blocks?.length) return null
  return <>{blocks.map((block, index) => <Block key={index} block={block} />)}</>
}

function Block({ block }: { block: any }) {
  switch (block.blockType) {
    case 'richText':
      return (
        <section className="prose prose-slate max-w-none my-10">
          <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(block.content, null, 2)}</pre>
        </section>
      )
    case 'image':
      return (
        <section className="my-10">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Image CMS : {block.caption || 'sans légende'}</p>
            </CardContent>
          </Card>
        </section>
      )
    case 'quickLinks':
      return (
        <section className="my-10 grid gap-4 md:grid-cols-3">
          {block.links?.map((link: any, i: number) => (
            <Link key={i} href={link.url} className="no-underline">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <strong className="text-[15px] font-semibold text-foreground">{link.label}</strong>
                  {link.description && <p className="mt-2 text-[13px] text-muted-foreground">{link.description}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )
    case 'collectionList':
      return (
        <section className="my-10">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold">{block.title || 'Liste automatique'}</h2>
              <p className="mt-2 text-muted-foreground">À brancher sur la collection : {block.collection}</p>
            </CardContent>
          </Card>
        </section>
      )
    case 'panneauPocket': {
      const widgetUrl = block.widgetUrl || process.env.NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL
      return (
        <section className="my-10">
          <h2 className="text-2xl font-bold mb-4">{block.title}</h2>
          {widgetUrl
            ? <iframe src={widgetUrl} title="PanneauPocket" className="w-full min-h-[520px] rounded-xl border border-border bg-white" />
            : <p className="text-muted-foreground">URL du widget PanneauPocket à configurer.</p>
          }
        </section>
      )
    }
    default:
      return null
  }
}
