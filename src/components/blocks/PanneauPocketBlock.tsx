interface PanneauPocketBlockProps {
  title?: string | null
  widgetUrl?: string | null
}

export function PanneauPocketBlock({ title, widgetUrl }: PanneauPocketBlockProps) {
  const url = widgetUrl || process.env.NEXT_PUBLIC_PANNEAUPOCKET_WIDGET_URL

  return (
    <section className="my-8">
      {title && <h2 className="text-2xl font-bold text-text mb-4">{title}</h2>}
      {url ? (
        <iframe
          src={url}
          title="PanneauPocket — informations et alertes locales"
          className="w-full min-h-[520px] rounded-2xl border border-border bg-white"
        />
      ) : (
        <p className="text-sm text-muted italic">Widget PanneauPocket non configuré.</p>
      )}
    </section>
  )
}
