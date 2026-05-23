import 'dotenv/config'
import { getPayload } from 'payload'
import type { CollectionSlug } from 'payload'
import config from './payload.config'

if (process.env.NODE_ENV !== 'development') {
  console.error('[seed] Refused: NODE_ENV is not "development"')
  process.exit(1)
}

const payload = await getPayload({ config })

try {
  await seedAssociations(payload)
  await seedElectedOfficials(payload)
  await seedNews(payload)
  await seedEventCategories(payload)
  await seedEvents(payload)
  await seedPages(payload)
  await seedNavigation(payload)
  await seedGlobals(payload)
  console.log('[seed] Done.')
} catch (err) {
  console.error('[seed] Error:', err)
  process.exitCode = 1
} finally {
  await payload.db.destroy?.()
}

function richText(text: string) {
  return {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'paragraph' as const,
          children: [{ type: 'text' as const, text, version: 1 as const }],
          version: 1 as const,
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1 as const,
    },
  }
}

async function seedCollection<T extends Record<string, unknown>>(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: CollectionSlug,
  items: T[],
  uniqueKey: keyof T,
) {
  let inserted = 0
  let skipped = 0

  for (const item of items) {
    const existing = await payload.find({
      collection,
      where: { [uniqueKey as string]: { equals: item[uniqueKey] } },
      overrideAccess: true,
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      skipped++
      continue
    }

    await payload.create({ collection, data: item as any, overrideAccess: true })
    inserted++
  }

  console.log(`[seed] ${collection}: ${inserted} inserted, ${skipped} skipped`)
}

async function seedAssociations(payload: Awaited<ReturnType<typeof getPayload>>) {
  const items = [
    {
      name: 'FC Vacqueyras',
      category: 'Sport',
      email: 'fc@vacqueyras-fictif.fr',
      phone: '04 90 11 22 33',
      website: 'https://fcvacqueyras-fictif.fr',
    },
    {
      name: 'Amis du Patrimoine',
      category: 'Culture',
      email: 'patrimoine@vacqueyras-fictif.fr',
      phone: '04 90 11 22 44',
    },
    {
      name: 'Entraide Locale',
      category: 'Solidarité',
      email: 'entraide@vacqueyras-fictif.fr',
      phone: '04 90 11 22 55',
    },
  ]
  await seedCollection(payload, 'associations', items, 'name')
}

async function seedElectedOfficials(payload: Awaited<ReturnType<typeof getPayload>>) {
  const items = [
    { name: 'Jean-Pierre Faure', role: 'Maire', delegation: '', order: 1 },
    { name: 'Marie Lefebvre', role: '1ère adjointe', delegation: 'Urbanisme et aménagement', order: 2 },
    { name: 'Thomas Girard', role: '2ème adjoint', delegation: 'Finances et budget', order: 3 },
    { name: 'Isabelle Moreau', role: '3ème adjointe', delegation: 'Culture et communication', order: 4 },
    { name: 'Luc Bonnet', role: '4ème adjoint', delegation: 'Sports et associations', order: 5 },
  ]
  await seedCollection(payload, 'elected-officials', items, 'name')
}

async function seedNews(payload: Awaited<ReturnType<typeof getPayload>>) {
  const items = [
    {
      title: 'Inauguration de la nouvelle salle polyvalente',
      slug: 'inauguration-salle-polyvalente',
      summary: 'La commune inaugure sa nouvelle salle polyvalente ce samedi en présence des élus et des habitants.',
      publishedAt: '2026-04-15T10:00:00.000Z',
      featured: true,
      content: richText("La nouvelle salle polyvalente de Vacqueyras a été inaugurée samedi 15 avril en présence du conseil municipal et d'une centaine d'habitants. Cet équipement de 300 places permettra d'accueillir les événements associatifs, culturels et municipaux de la commune."),
      _status: 'published',
    },
    {
      title: 'Travaux sur la RD7 : perturbations à prévoir',
      slug: 'travaux-route-departementale',
      summary: 'Des travaux de voirie débutent sur la RD7 du 1er au 20 juin. Circulation alternée mise en place.',
      publishedAt: '2026-05-10T08:00:00.000Z',
      featured: false,
      content: richText("Le Département de Vaucluse engage des travaux de réfection de la chaussée sur la RD7 entre Vacqueyras et Sarrians. Ces travaux se dérouleront du 1er au 20 juin 2026. Une circulation alternée sera mise en place en semaine de 8h à 18h."),
      _status: 'published',
    },
    {
      title: 'Compte-rendu du conseil municipal de mars 2026',
      slug: 'conseil-municipal-mars-2026',
      summary: 'Retrouvez le compte-rendu complet du conseil municipal du 18 mars 2026.',
      publishedAt: '2026-03-25T09:00:00.000Z',
      featured: false,
      content: richText("Le conseil municipal s'est réuni le 18 mars 2026 sous la présidence de Jean-Pierre Faure, Maire. Étaient présents 11 conseillers sur 15. À l'ordre du jour : approbation du budget primitif 2026, délibération sur la réfection de la voirie communale, questions diverses."),
      _status: 'published',
    },
    {
      title: 'La fête du village revient le 14 juillet',
      slug: 'fete-du-village-2026',
      summary: "La fête communale de Vacqueyras aura lieu le 14 juillet avec bal, feu d'artifice et repas partagé.",
      publishedAt: '2026-05-01T10:00:00.000Z',
      featured: true,
      content: richText("La fête du village est de retour le 14 juillet 2026 ! Au programme : apéritif offert par la municipalité dès 18h, repas partagé en plein air (inscription avant le 5 juillet), bal folk à partir de 21h et feu d'artifice à 22h30. Entrée libre."),
      _status: 'published',
    },
    {
      title: 'Nouveaux horaires de la déchetterie',
      slug: 'nouveau-service-dechetterie',
      summary: "Depuis le 1er avril, la déchetterie intercommunale adopte de nouveaux horaires d'ouverture.",
      publishedAt: '2026-04-01T07:00:00.000Z',
      featured: false,
      content: richText("Suite à la réorganisation du service intercommunal de collecte des déchets, la déchetterie de Sarrians est désormais ouverte du lundi au samedi de 8h à 12h et de 14h à 18h. Elle est fermée le dimanche et les jours fériés."),
      _status: 'published',
    },
    {
      title: 'Plantation de 30 arbres dans le parc communal',
      slug: 'plantation-arbres-parc',
      summary: "Dans le cadre du plan de végétalisation, 30 arbres fruitiers et d'ombrage ont été plantés dans le parc.",
      publishedAt: '2026-02-20T10:00:00.000Z',
      featured: false,
      content: richText("Dans le cadre du plan communal de végétalisation, 30 arbres ont été plantés en février dans le parc municipal. On y trouve des micocouliers, des tilleuls, des amandiers et des figuiers, choisis pour leur résistance à la sécheresse et leur valeur pour la biodiversité locale."),
      _status: 'published',
    },
    {
      title: 'Résultats des élections locales',
      slug: 'resultats-elections-locales',
      summary: 'Jean-Pierre Faure est réélu maire de Vacqueyras avec 68 % des suffrages exprimés.',
      publishedAt: '2026-01-15T18:00:00.000Z',
      featured: false,
      content: richText("Les élections municipales complémentaires du 13 janvier 2026 ont vu la réélection de Jean-Pierre Faure à la tête de la commune de Vacqueyras avec 68 % des suffrages exprimés. Le nouveau conseil municipal se réunit pour la première fois le 28 janvier."),
      _status: 'published',
    },
    {
      title: 'Présentation du budget communal 2026',
      slug: 'budget-communal-2026',
      summary: 'Le budget primitif 2026 a été voté en conseil municipal. Découvrez les grandes orientations financières.',
      publishedAt: '2026-03-28T09:00:00.000Z',
      featured: false,
      content: richText("Le budget primitif 2026 de la commune de Vacqueyras s'élève à 1 250 000 € en section de fonctionnement et 320 000 € en section d'investissement. Les principaux projets financés : réfection des trottoirs du centre bourg, rénovation énergétique de l'école primaire, et acquisition d'un nouveau véhicule de voirie."),
      _status: 'published',
    },
  ]
  await seedCollection(payload, 'news', items, 'slug')
}

async function seedEventCategories(payload: Awaited<ReturnType<typeof getPayload>>) {
  const items = [
    { name: 'Municipal',     slug: 'municipal',    color: '#1D4ED8' },
    { name: 'Association',   slug: 'association',  color: '#7C3AED' },
    { name: 'Culture',       slug: 'culture',      color: '#DB2777' },
    { name: 'Sport',         slug: 'sport',        color: '#059669' },
    { name: 'École',         slug: 'ecole',        color: '#D97706' },
    { name: 'Bibliothèque',  slug: 'bibliotheque', color: '#0891B2' },
    { name: 'Autre',         slug: 'autre',        color: '#6B7280' },
  ]
  await seedCollection(payload, 'event-categories', items, 'slug')
}

async function seedEvents(payload: Awaited<ReturnType<typeof getPayload>>) {
  const assocResult = await payload.find({
    collection: 'associations',
    overrideAccess: true,
    limit: 10,
  })
  const assocByName: Record<string, number> = {}
  for (const a of assocResult.docs) {
    assocByName[a.name] = a.id
  }

  const catResult = await payload.find({
    collection: 'event-categories',
    overrideAccess: true,
    limit: 20,
  })
  const catBySlug: Record<string, number> = {}
  for (const c of catResult.docs) {
    catBySlug[c.slug] = c.id
  }

  const items = [
    {
      title: 'Conseil municipal de juin 2026',
      slug: 'conseil-municipal-juin-2026',
      startDate: '2026-06-10T19:00:00.000Z',
      endDate: '2026-06-10T21:00:00.000Z',
      location: 'Salle du conseil municipal — Mairie de Vacqueyras',
      category: catBySlug['municipal'] ?? undefined,
      _status: 'published',
    },
    {
      title: 'Vide-grenier du FC Vacqueyras',
      slug: 'vide-grenier-fc-vacqueyras',
      startDate: '2026-05-31T08:00:00.000Z',
      endDate: '2026-05-31T17:00:00.000Z',
      location: 'Parking de la salle polyvalente',
      category: catBySlug['association'] ?? undefined,
      organizer: assocByName['FC Vacqueyras'] ?? undefined,
      _status: 'published',
    },
    {
      title: 'Exposition : 100 ans de Vacqueyras',
      slug: 'exposition-patrimoine',
      startDate: '2026-06-06T10:00:00.000Z',
      endDate: '2026-06-29T18:00:00.000Z',
      location: 'Salle polyvalente de Vacqueyras',
      category: catBySlug['culture'] ?? undefined,
      organizer: assocByName['Amis du Patrimoine'] ?? undefined,
      _status: 'published',
    },
    {
      title: 'Tournoi de foot inter-villages',
      slug: 'tournoi-foot-juillet',
      startDate: '2026-07-05T09:00:00.000Z',
      endDate: '2026-07-05T18:00:00.000Z',
      location: 'Stade municipal',
      category: catBySlug['sport'] ?? undefined,
      organizer: assocByName['FC Vacqueyras'] ?? undefined,
      _status: 'published',
    },
    {
      title: 'Permanence du maire',
      slug: 'permanence-maire-juin',
      startDate: '2026-06-20T09:00:00.000Z',
      endDate: '2026-06-20T11:00:00.000Z',
      location: 'Mairie de Vacqueyras — bureau du maire',
      category: catBySlug['municipal'] ?? undefined,
      _status: 'published',
    },
    {
      title: 'Atelier jardinage partagé',
      slug: 'atelier-jardinage-mai',
      startDate: '2026-05-23T10:00:00.000Z',
      endDate: '2026-05-23T12:00:00.000Z',
      location: 'Jardin partagé — chemin de la Garenne',
      category: catBySlug['autre'] ?? undefined,
      _status: 'published',
    },
    {
      title: 'Fête de la Musique 2026',
      slug: 'fete-musique-2026',
      startDate: '2026-06-21T18:00:00.000Z',
      endDate: '2026-06-21T23:30:00.000Z',
      location: 'Place de la Mairie',
      category: catBySlug['culture'] ?? undefined,
      _status: 'published',
    },
    {
      title: 'Marché de Noël 2026',
      slug: 'marche-noel-2026',
      startDate: '2026-12-13T10:00:00.000Z',
      endDate: '2026-12-13T19:00:00.000Z',
      location: 'Place du village',
      category: catBySlug['culture'] ?? undefined,
      _status: 'published',
    },
    // Événement en cours (startDate passé, endDate futur) — teste le fix "ongoing events in calendar query"
    {
      title: 'Exposition "Racines Provençales"',
      slug: 'exposition-racines-provencales',
      startDate: '2026-05-10T10:00:00.000Z',
      endDate: '2026-06-01T18:00:00.000Z',
      location: 'Salle polyvalente de Vacqueyras',
      category: catBySlug['culture'] ?? undefined,
      organizer: assocByName['Amis du Patrimoine'] ?? undefined,
      description: richText("Exposition retraçant l'histoire viticole et agricole de la région, organisée par l'association Amis du Patrimoine. Entrée libre."),
      _status: 'published',
    },
    // Deux événements le même jour (samedi 23 mai) — teste les points multiples (isMultiEvent) dans MiniCalendar
    {
      title: 'Concours de pétanque inter-villages',
      slug: 'concours-petanque-mai',
      startDate: '2026-05-23T14:00:00.000Z',
      endDate: '2026-05-23T18:00:00.000Z',
      location: 'Boulodrome municipal',
      category: catBySlug['sport'] ?? undefined,
      organizer: assocByName['FC Vacqueyras'] ?? undefined,
      _status: 'published',
    },
    {
      title: 'Collecte de livres — Bibliothèque',
      slug: 'collecte-livres-bibliotheque-mai',
      startDate: '2026-05-23T09:00:00.000Z',
      endDate: '2026-05-23T12:00:00.000Z',
      location: 'Bibliothèque municipale',
      category: catBySlug['bibliotheque'] ?? undefined,
      _status: 'published',
    },
    // Événements des prochains jours — remplissent le carousel
    {
      title: 'Réunion publique — Plan local d\'urbanisme',
      slug: 'reunion-publique-urbanisme-mai',
      startDate: '2026-05-27T19:00:00.000Z',
      endDate: '2026-05-27T21:00:00.000Z',
      location: 'Salle du conseil municipal — Mairie de Vacqueyras',
      category: catBySlug['municipal'] ?? undefined,
      description: richText("La mairie vous invite à une réunion publique de présentation du projet de révision du Plan Local d'Urbanisme. Venez poser vos questions et contribuer à l'avenir de notre commune."),
      _status: 'published',
    },
    {
      title: 'Sortie nature avec l\'école primaire',
      slug: 'sortie-ecole-nature-mai',
      startDate: '2026-05-28T08:30:00.000Z',
      endDate: '2026-05-28T16:30:00.000Z',
      location: 'Forêt communale — sentier des Garrigues',
      category: catBySlug['ecole'] ?? undefined,
      _status: 'published',
    },
    {
      title: 'Fête des voisins',
      slug: 'fete-des-voisins-2026',
      startDate: '2026-05-29T18:00:00.000Z',
      endDate: '2026-05-29T22:00:00.000Z',
      location: 'Place de la Fontaine',
      category: catBySlug['association'] ?? undefined,
      organizer: assocByName['Entraide Locale'] ?? undefined,
      description: richText("La Fête des voisins revient à Vacqueyras ! Venez partager un moment convivial avec vos voisins autour d'un apéritif et d'un repas partagé. Chacun apporte un plat ou une boisson."),
      _status: 'published',
    },
  ]
  await seedCollection(payload, 'events', items, 'slug')
}

async function seedPages(payload: Awaited<ReturnType<typeof getPayload>>) {
  const items = [
    {
      title: 'Notre commune',
      slug: 'notre-commune',
      summary: "Découvrez l'histoire, la géographie et la vie de la commune de Vacqueyras.",
      layout: [
        {
          blockType: 'richText',
          content: richText("Vacqueyras est une commune du Vaucluse (84) située dans le département de Vaucluse, dans la région Provence-Alpes-Côte d'Azur. Elle compte environ 1 000 habitants et est connue pour son vignoble d'appellation Vacqueyras AOC. La mairie assure les services publics locaux et l'animation du territoire."),
        },
      ],
      _status: 'published',
    },
    {
      title: 'Contact',
      slug: 'contact',
      summary: "Coordonnées et horaires d'ouverture de la mairie de Vacqueyras.",
      layout: [
        {
          blockType: 'richText',
          content: richText("Mairie de Vacqueyras\nPlace de la Mairie\n84190 Vacqueyras\n\nTéléphone : 04 90 00 00 00\nEmail : mairie@vacqueyras-fictif.fr\n\nHoraires d'ouverture :\nLundi, mercredi, vendredi : 9h–12h\nMardi, jeudi : 9h–12h et 14h–17h"),
        },
      ],
      _status: 'published',
    },
  ]
  await seedCollection(payload, 'pages', items, 'slug')
}

async function seedGlobals(payload: Awaited<ReturnType<typeof getPayload>>) {
  // MairieInfo
  const mairieInfo = await payload.findGlobal({ slug: 'mairie-info', overrideAccess: true })
  if (!mairieInfo.address || mairieInfo.address === '1 Rue de la Mairie, 41160 La Ville-aux-Clercs') {
    await payload.updateGlobal({
      slug: 'mairie-info',
      overrideAccess: true,
      data: {
        address: 'Place de la Mairie, 84190 Vacqueyras',
        phone: '04 90 00 00 00',
        email: 'mairie@vacqueyras-fictif.fr',
        openingHours: [
          { days: 'Lundi, Mercredi, Vendredi', hours: '9h – 12h' },
          { days: 'Mardi, Jeudi', hours: '9h – 12h et 14h – 17h' },
        ],
      },
    })
    console.log('[seed] mairie-info: updated')
  } else {
    console.log('[seed] mairie-info: skipped (already set)')
  }

  // SiteSettings
  const siteSettings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
  if (!siteSettings.heroTitle || siteSettings.heroTitle === 'La Ville-aux-Clercs') {
    await payload.updateGlobal({
      slug: 'site-settings',
      overrideAccess: true,
      data: {
        heroTitle: 'Vacqueyras',
        heroSubtitle: 'Commune du Vaucluse — Provence',
      },
    })
    console.log('[seed] site-settings: updated')
  } else {
    console.log('[seed] site-settings: skipped (already set)')
  }

  // HomepageSettings
  const homepageSettings = await payload.findGlobal({ slug: 'homepage-settings', overrideAccess: true })
  if (!homepageSettings.quickLinks || homepageSettings.quickLinks.length === 0) {
    await payload.updateGlobal({
      slug: 'homepage-settings',
      overrideAccess: true,
      data: {
        quickLinks: [
          { label: 'Actualités', icon: 'Newspaper', href: '/actualites' },
          { label: 'Agenda', icon: 'CalendarDays', href: '/agenda' },
          { label: 'Associations', icon: 'Users', href: '/associations' },
          { label: 'Documents', icon: 'FileText', href: '/documents' },
          { label: 'Contact', icon: 'Phone', href: '/contact' },
        ],
      },
    })
    console.log('[seed] homepage-settings: updated')
  } else {
    console.log('[seed] homepage-settings: skipped (already set)')
  }
}

async function seedNavigation(payload: Awaited<ReturnType<typeof getPayload>>) {
  const pagesResult = await payload.find({
    collection: 'pages',
    where: { slug: { in: ['notre-commune', 'contact'] } },
    overrideAccess: true,
    limit: 10,
  })
  const pageBySlug: Record<string, number> = {}
  for (const p of pagesResult.docs) {
    pageBySlug[p.slug] = p.id
  }

  const menus = [
    {
      name: 'Menu principal',
      location: 'main',
      items: [
        {
          label: 'La Mairie',
          kind: 'page',
          page: pageBySlug['notre-commune'],
          children: [
            { label: 'Notre commune', kind: 'page', page: pageBySlug['notre-commune'] },
            { label: 'Contact', kind: 'page', page: pageBySlug['contact'] },
          ],
        },
        { label: 'Actualités', kind: 'newsArchive' },
        { label: 'Agenda', kind: 'eventsArchive' },
        {
          label: 'Vie locale',
          kind: 'external',
          url: '#',
          children: [
            { label: 'Associations', kind: 'associationsArchive' },
            { label: 'Documents', kind: 'documentsArchive' },
          ],
        },
      ],
    },
    {
      name: 'Menu footer',
      location: 'footer',
      items: [
        { label: 'Notre commune', kind: 'page', page: pageBySlug['notre-commune'] },
        { label: 'Actualités', kind: 'external', url: '/actualites' },
        { label: 'Agenda', kind: 'external', url: '/agenda' },
        { label: 'Associations', kind: 'external', url: '/associations' },
        { label: 'Contact', kind: 'page', page: pageBySlug['contact'] },
      ],
    },
  ]

  let inserted = 0
  let skipped = 0

  for (const menu of menus) {
    const existing = await payload.find({
      collection: 'navigation',
      where: { location: { equals: menu.location } },
      overrideAccess: true,
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      skipped++
      continue
    }

    await payload.create({ collection: 'navigation', data: menu as any, overrideAccess: true })
    inserted++
  }

  console.log(`[seed] navigation: ${inserted} inserted, ${skipped} skipped`)
}
