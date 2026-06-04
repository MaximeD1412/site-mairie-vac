export const DOCUMENT_CATEGORIES = [
  { label: 'Bulletin municipal', value: 'bulletin-municipal' },
  { label: 'Ptitmag', value: 'ptitmag' },
  { label: 'BEPOS', value: 'bepos' },
  { label: 'PV du conseil municipal', value: 'pv-conseil' },
  { label: 'Actes administratifs', value: 'actes-administratifs' },
  { label: 'Compte-rendu', value: 'compte-rendu' },
  { label: 'Arrêté', value: 'arrete' },
  { label: 'Formulaire', value: 'formulaire' },
  { label: 'Autre', value: 'autre' },
] as const

export type CategoryValue = (typeof DOCUMENT_CATEGORIES)[number]['value']
export type CategoryOption = (typeof DOCUMENT_CATEGORIES)[number]

export function getAvailableTabs(docs: { category?: string | null }[]): CategoryOption[] {
  const present = new Set(docs.map(d => d.category))
  return DOCUMENT_CATEGORIES.filter(c => present.has(c.value)) as unknown as CategoryOption[]
}

export function getCategoryLabel(value: string): string {
  return DOCUMENT_CATEGORIES.find(c => c.value === value)?.label ?? value
}
