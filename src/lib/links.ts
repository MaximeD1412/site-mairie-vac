export function hrefFromNavItem(item: any): string {
  if (item.kind === 'external') return item.url || '#'
  if (item.kind === 'newsArchive') return '/actualites'
  if (item.kind === 'eventsArchive') return '/agenda'
  if (item.kind === 'documentsArchive') return '/documents'
  if (item.kind === 'associationsArchive') return '/associations'
  if (item.page && typeof item.page === 'object') return `/${item.page.slug}`
  return '#'
}
