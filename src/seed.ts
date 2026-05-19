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
  await seedEvents(payload)
  await seedPages(payload)
  await seedGlobals(payload)
  console.log('[seed] Done.')
} finally {
  await payload.db.destroy?.()

  process.exit(0)
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
