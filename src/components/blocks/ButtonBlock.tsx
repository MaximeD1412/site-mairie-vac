interface ButtonBlockProps {
  text: string
  url: string
  variant: 'primary' | 'secondary'
}

const variantClass: Record<ButtonBlockProps['variant'], string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'border border-primary text-primary hover:bg-primary/10',
}

export function ButtonBlock({ text, url, variant }: ButtonBlockProps) {
  return (
    <div className="my-6 flex justify-center">
      <a
        href={url}
        className={`inline-block rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${variantClass[variant]}`}
      >
        {text}
      </a>
    </div>
  )
}
