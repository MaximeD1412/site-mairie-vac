import Link from 'next/link'

export async function RenderBlocks({ blocks }: { blocks?: any[] }) {
  if (!blocks?.length) return null
  return <>{blocks.map((block, index) => <Block key={index} block={block} />)}</>
}

function Block({ block }: { block: any }) {
  switch (block.blockType) {
    case 'richText':
      return <section className="prose prose-slate max-w-none my-10"><pre className="whitespace-pre-wrap font-sans">{JSON.stringify(block.content, null, 2)}</pre></section>
    case 'image':
      return <section className="my-10 rounded-2xl bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Image CMS : {block.caption || 'sans légende'}</p></section>
    case 'quickLinks':
      return (
        <section className="my-10 grid gap-4 md:grid-cols-3">
          {block.links?.map((link: any, i: number) => (
            <Link key={i} href={link.url} className="rounded-2xl bg-white p-5 shadow-sm no-underline hover:shadow-md">
              <strong className="text-teal-800">{link.label}</strong>
              {link.description && <p className="mt-2 text-sm text-slate-600">{link.description}</p>}
            </Link>
          ))}
        </section>
      )
    case 'collectionList':
      return <section className="my-10 rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold">{block.title || 'Liste automatique'}</h2><p className="mt-2 text-slate-600">À brancher sur la collection : {block.collection}</p></section>
    case 'panneauPocket':
      const widgetUrl = block.widgetUrl || process.env.NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL
      return <section className="my-10"><h2 className="text-2xl font-bold mb-4">{block.title}</h2>{widgetUrl ? <iframe src={widgetUrl} title="PanneauPocket" className="w-full min-h-[520px] rounded-2xl border border-slate-200 bg-white" /> : <p>URL du widget PanneauPocket à configurer.</p>}</section>
    default:
      return null
  }
}
