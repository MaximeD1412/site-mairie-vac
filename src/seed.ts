// =============================================================
// SEED DE DÉMONSTRATION — données fictives, développement uniquement
// Couvre toutes les collections et tous les blocs CMS seables :
//   associations, élus, actualités, catégories d'événements,
//   événements, pages (richText, quickLinks, collectionList,
//   accordion, button, contact, map), navigation, globals.
// GalleryBlock et ImageBlock nécessitent des médias importés
//   manuellement et ne sont pas inclus dans ce seed.
// Ne tourne jamais en production (NODE_ENV !== 'development').
// =============================================================
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
      name: 'Association Sportive La Percheronne',
      category: 'Sport',
      email: 'lapercheronne@lavilleauxclercs-fictif.fr',
      phone: '02 54 11 22 33',
      website: 'https://lapercheronne-fictif.fr',
    },
    {
      name: 'Amis du Patrimoine',
      category: 'Culture',
      email: 'patrimoine@lavilleauxclercs-fictif.fr',
      phone: '02 54 11 22 44',
    },
    {
      name: 'Entraide Locale',
      category: 'Solidarité',
      email: 'entraide@lavilleauxclercs-fictif.fr',
      phone: '02 54 11 22 55',
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
      content: richText("La nouvelle salle polyvalente de La Ville-aux-Clercs a été inaugurée samedi 15 avril en présence du conseil municipal et d'une centaine d'habitants. Cet équipement de 300 places permettra d'accueillir les événements associatifs, culturels et municipaux de la commune."),
      _status: 'published',
    },
    {
      title: 'Travaux sur la RD 10 : perturbations à prévoir',
      slug: 'travaux-route-departementale',
      summary: 'Des travaux de voirie débutent sur la RD 10 du 1er au 20 juin. Circulation alternée mise en place.',
      publishedAt: '2026-05-10T08:00:00.000Z',
      featured: false,
      content: richText("Le Département de Loir-et-Cher engage des travaux de réfection de la chaussée sur la RD 10 entre La-Ville-aux-Clercs et Mondoubleau. Ces travaux se dérouleront du 1er au 20 juin 2026. Une circulation alternée sera mise en place en semaine de 8h à 18h."),
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
      summary: "La fête communale de La Ville-aux-Clercs aura lieu le 14 juillet avec bal, feu d'artifice et repas partagé.",
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
      content: richText("Suite à la réorganisation du service intercommunal de collecte des déchets, la déchetterie intercommunale est désormais ouverte du lundi au samedi de 8h à 12h et de 14h à 18h. Elle est fermée le dimanche et les jours fériés."),
      _status: 'published',
    },
    {
      title: 'Plantation de 30 arbres dans le parc communal',
      slug: 'plantation-arbres-parc',
      summary: "Dans le cadre du plan de végétalisation, 30 arbres fruitiers et d'ombrage ont été plantés dans le parc.",
      publishedAt: '2026-02-20T10:00:00.000Z',
      featured: false,
      content: richText("Dans le cadre du plan communal de végétalisation, 30 arbres ont été plantés en février dans le parc municipal. On y trouve des chênes, des frênes, des tilleuls et des pommiers, choisis pour leur résistance et leur valeur pour la biodiversité locale."),
      _status: 'published',
    },
    {
      title: 'Résultats des élections locales',
      slug: 'resultats-elections-locales',
      summary: 'Jean-Pierre Faure est réélu maire de La Ville-aux-Clercs avec 68 % des suffrages exprimés.',
      publishedAt: '2026-01-15T18:00:00.000Z',
      featured: false,
      content: richText("Les élections municipales complémentaires du 13 janvier 2026 ont vu la réélection de Jean-Pierre Faure à la tête de la commune de La Ville-aux-Clercs avec 68 % des suffrages exprimés. Le nouveau conseil municipal se réunit pour la première fois le 28 janvier."),
      _status: 'published',
    },
    {
      title: 'Présentation du budget communal 2026',
      slug: 'budget-communal-2026',
      summary: 'Le budget primitif 2026 a été voté en conseil municipal. Découvrez les grandes orientations financières.',
      publishedAt: '2026-03-28T09:00:00.000Z',
      featured: false,
      content: richText("Le budget primitif 2026 de la commune de La Ville-aux-Clercs s'élève à 1 250 000 € en section de fonctionnement et 320 000 € en section d'investissement. Les principaux projets financés : réfection des trottoirs du centre bourg, rénovation énergétique de l'école primaire, et acquisition d'un nouveau véhicule de voirie."),
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
      location: 'Salle du conseil municipal — Mairie de La Ville-aux-Clercs',
      category: catBySlug['municipal'] ?? undefined,
      _status: 'published',
    },
    {
      title: "Vide-grenier de l'AS La Percheronne",
      slug: 'vide-grenier-as-percheronne',
      startDate: '2026-05-31T08:00:00.000Z',
      endDate: '2026-05-31T17:00:00.000Z',
      location: 'Parking de la salle polyvalente',
      category: catBySlug['association'] ?? undefined,
      organizer: assocByName['Association Sportive La Percheronne'] ?? undefined,
      _status: 'published',
    },
    {
      title: 'Exposition : 100 ans de La Ville-aux-Clercs',
      slug: 'exposition-patrimoine',
      startDate: '2026-06-06T10:00:00.000Z',
      endDate: '2026-06-29T18:00:00.000Z',
      location: 'Salle polyvalente de La Ville-aux-Clercs',
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
      organizer: assocByName['Association Sportive La Percheronne'] ?? undefined,
      _status: 'published',
    },
    {
      title: 'Permanence du maire',
      slug: 'permanence-maire-juin',
      startDate: '2026-06-20T09:00:00.000Z',
      endDate: '2026-06-20T11:00:00.000Z',
      location: 'Mairie de La Ville-aux-Clercs — bureau du maire',
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
      title: 'Exposition "Racines du Perche"',
      slug: 'exposition-racines-du-perche',
      startDate: '2026-05-10T10:00:00.000Z',
      endDate: '2026-06-01T18:00:00.000Z',
      location: 'Salle polyvalente de La Ville-aux-Clercs',
      category: catBySlug['culture'] ?? undefined,
      organizer: assocByName['Amis du Patrimoine'] ?? undefined,
      description: richText("Exposition retraçant l'histoire agricole et patrimoniale de la région, organisée par l'association Amis du Patrimoine. Entrée libre."),
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
      organizer: assocByName['Association Sportive La Percheronne'] ?? undefined,
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
      title: "Réunion publique — Plan local d'urbanisme",
      slug: 'reunion-publique-urbanisme-mai',
      startDate: '2026-05-27T19:00:00.000Z',
      endDate: '2026-05-27T21:00:00.000Z',
      location: 'Salle du conseil municipal — Mairie de La Ville-aux-Clercs',
      category: catBySlug['municipal'] ?? undefined,
      description: richText("La mairie vous invite à une réunion publique de présentation du projet de révision du Plan Local d'Urbanisme. Venez poser vos questions et contribuer à l'avenir de notre commune."),
      _status: 'published',
    },
    {
      title: "Sortie nature avec l'école primaire",
      slug: 'sortie-ecole-nature-mai',
      startDate: '2026-05-28T08:30:00.000Z',
      endDate: '2026-05-28T16:30:00.000Z',
      location: 'Forêt communale — sentier des Charmes',
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
      description: richText("La Fête des voisins revient à La Ville-aux-Clercs ! Venez partager un moment convivial avec vos voisins autour d'un apéritif et d'un repas partagé. Chacun apporte un plat ou une boisson."),
      _status: 'published',
    },
  ]
  await seedCollection(payload, 'events', items, 'slug')
}

// Pages use upsert (update if exists) so the seed definition is always the source of truth.
async function seedPages(payload: Awaited<ReturnType<typeof getPayload>>) {
  const pages = [
    {
      title: 'Notre commune',
      slug: 'notre-commune',
      summary: "Découvrez l'histoire, la géographie et la vie de la commune de La Ville-aux-Clercs.",
      layout: [
        {
          blockType: 'richText',
          content: richText("La Ville-aux-Clercs est une commune de Loir-et-Cher (41) située dans la région Centre-Val de Loire, dans le Perche vendômois. Elle compte environ 1 200 habitants. La mairie assure les services publics locaux et l'animation du territoire."),
        },
        {
          blockType: 'quickLinks',
          links: [
            { label: 'Actualités', url: '/actualites', description: 'Informations municipales' },
            { label: 'Agenda', url: '/agenda', description: 'Événements à venir' },
            { label: 'Associations', url: '/associations', description: 'Vie associative' },
            { label: 'Documents', url: '/documents', description: 'Bulletins, arrêtés, formulaires' },
            { label: 'Démarches', url: '/demarches', description: 'Vos démarches administratives' },
          ],
        },
        {
          blockType: 'collectionList',
          title: 'Dernières actualités',
          collection: 'news',
          limit: 3,
        },
      ],
      _status: 'published',
    },
    {
      title: 'Contact',
      slug: 'contact',
      summary: "Coordonnées et horaires d'ouverture de la mairie de La Ville-aux-Clercs.",
      layout: [
        {
          blockType: 'richText',
          content: richText("Mairie de La Ville-aux-Clercs\n1 Rue de la Mairie\n41160 La Ville-aux-Clercs\n\nTéléphone : 02 54 00 00 00\nEmail : mairie@lavilleauxclercs-fictif.fr\n\nHoraires d'ouverture :\nLundi, mercredi, vendredi : 9h–12h\nMardi, jeudi : 9h–12h et 14h–17h"),
        },
        {
          blockType: 'map',
          title: 'Où nous trouver',
          address: '1 Rue de la Mairie, 41160 La Ville-aux-Clercs',
          lat: 47.97,
          lng: 0.99,
        },
        {
          blockType: 'contact',
          title: 'Nous contacter',
        },
      ],
      _status: 'published',
    },
    {
      title: 'Vie locale',
      slug: 'vie-locale',
      summary: "Associations, initiatives et dynamiques de la vie locale à La Ville-aux-Clercs.",
      layout: [
        {
          blockType: 'richText',
          content: richText("La Ville-aux-Clercs dispose d'un tissu associatif actif qui anime la vie du village tout au long de l'année : sport, culture, solidarité. Retrouvez ici les associations locales, leurs activités et comment les rejoindre."),
        },
        {
          blockType: 'collectionList',
          title: 'Associations locales',
          collection: 'associations',
          limit: 6,
        },
        {
          blockType: 'accordion',
          items: [
            {
              title: 'Comment créer une association à La Ville-aux-Clercs ?',
              content: richText("Pour créer une association loi 1901, déposez votre déclaration en préfecture ou en ligne sur le site service-public.fr. La mairie peut vous accompagner dans vos démarches et vous renseigner sur les aides disponibles."),
            },
            {
              title: 'Comment réserver la salle polyvalente ?',
              content: richText("La salle polyvalente est disponible pour les associations locales et les particuliers. Contactez le secrétariat de la mairie pour vérifier les disponibilités et signer une convention de mise à disposition."),
            },
            {
              title: 'Quelles aides la commune apporte-t-elle aux associations ?',
              content: richText("La commune attribue chaque année des subventions aux associations locales sur présentation d'un dossier. Les critères d'attribution sont présentés lors du conseil municipal de début d'année."),
            },
          ],
        },
        {
          blockType: 'button',
          text: 'Nous contacter pour votre projet associatif',
          url: '/contact',
          variant: 'primary',
        },
      ],
      _status: 'published',
    },
    {
      title: "Déclaration d'accessibilité",
      slug: 'accessibilite',
      summary: "État de conformité du site de la mairie de La Ville-aux-Clercs au référentiel RGAA 4.1.",
      layout: [
        {
          blockType: 'richText',
          content: richText("La mairie de La Ville-aux-Clercs s'engage à rendre son site internet accessible conformément à l'article 47 de la loi n° 2005-102 du 11 février 2005. Cette déclaration d'accessibilité s'applique au site officiel de la mairie de La Ville-aux-Clercs."),
        },
        {
          blockType: 'richText',
          content: richText("État de conformité : Le site est en conformité partielle avec le Référentiel Général d'Amélioration de l'Accessibilité (RGAA) version 4.1. Audit réalisé le 3 juin 2026. Périmètre audité : page d'accueil, page d'actualité, page CMS générique."),
        },
        {
          blockType: 'richText',
          content: richText("Critères conformes : H1 unique par page avec hiérarchie cohérente — HTML sémantique (landmarks header, nav, main, footer) — Navigation clavier complète — Focus visible sur tous les éléments interactifs — Contraste des couleurs AA (4,5:1) pour les textes principaux — Attributs alt sur toutes les images — Labels associés à tous les champs de formulaire — Liens avec intitulés explicites — Contrôle du défilement automatique (bouton pause/play) — Annonces live region pour les composants dynamiques (calendrier, carrousel) — Langue de la page déclarée (lang=\"fr\") — Lien d'évitement vers le contenu principal."),
        },
        {
          blockType: 'richText',
          content: richText("Critère partiellement conforme : Couleurs des badges de catégorie d'événements — définies librement dans le CMS, la couleur par défaut peut présenter un ratio de contraste inférieur au seuil AA (4,5:1). Impact faible. Recommandation aux éditeurs : choisir des couleurs suffisamment foncées pour les catégories."),
        },
        {
          blockType: 'richText',
          content: richText("Contact accessibilité : Si vous rencontrez un obstacle qui vous empêche d'accéder à un contenu ou à une fonctionnalité de ce site, merci de nous contacter. Vous pouvez nous joindre par email à mairie@lavilleauxclercs-fictif.fr ou par courrier à Mairie de La Ville-aux-Clercs, 1 Rue de la Mairie, 41160 La Ville-aux-Clercs. Nous nous engageons à vous répondre dans un délai de 5 jours ouvrés."),
        },
      ],
      _status: 'published',
    },
    {
      title: 'Démarches',
      slug: 'demarches',
      summary: "Vos démarches administratives courantes : état civil, urbanisme, élections.",
      layout: [
        {
          blockType: 'richText',
          content: richText("La mairie de La Ville-aux-Clercs vous accompagne dans vos démarches administratives. Retrouvez ci-dessous les principales procédures et les documents nécessaires."),
        },
        {
          blockType: 'accordion',
          items: [
            {
              title: 'Demande d'acte de naissance, mariage ou décès',
              content: richText("Vous pouvez demander un acte d'état civil directement à la mairie ou en ligne sur service-public.fr. Munissez-vous de votre pièce d'identité et précisez la nature de l'acte et la date de l'événement."),
            },
            {
              title: 'Inscription sur les listes électorales',
              content: richText("L'inscription est possible toute l'année en ligne sur mon.service-public.fr ou directement à la mairie. Pour voter lors d'une élection, l'inscription doit être faite avant le 31 décembre de l'année précédente."),
            },
            {
              title: 'Demande de permis de construire ou déclaration de travaux',
              content: richText("Déposez votre dossier en mairie ou via le guichet numérique des autorisations d'urbanisme (GNAU). Le délai d'instruction est de 1 à 3 mois selon la nature des travaux."),
            },
            {
              title: 'Certificat d'urbanisme',
              content: richText("Le certificat d'urbanisme informe sur les règles applicables à un terrain. Déposez votre demande en mairie avec le formulaire Cerfa n°13410. Le délai de réponse est d'un mois (informatif) ou deux mois (opérationnel)."),
            },
          ],
        },
        {
          blockType: 'button',
          text: 'Accéder à service-public.fr',
          url: 'https://www.service-public.fr',
          variant: 'secondary',
        },
      ],
      _status: 'published',
    },
  ]

  let inserted = 0
  let updated = 0

  for (const page of pages) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      overrideAccess: true,
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      await payload.update({ collection: 'pages', id: existing.docs[0].id, data: page as any, overrideAccess: true })
      updated++
    } else {
      await payload.create({ collection: 'pages', data: page as any, overrideAccess: true })
      inserted++
    }
  }

  console.log(`[seed] pages: ${inserted} inserted, ${updated} updated`)
}

async function seedGlobals(payload: Awaited<ReturnType<typeof getPayload>>) {
  // MairieInfo
  const mairieInfo = await payload.findGlobal({ slug: 'mairie-info', overrideAccess: true })
  if (!mairieInfo.address || mairieInfo.address === '1 Rue de la Mairie, 41160 La Ville-aux-Clercs') {
    await payload.updateGlobal({
      slug: 'mairie-info',
      overrideAccess: true,
      data: {
        address: '1 Rue de la Mairie, 41160 La Ville-aux-Clercs',
        phone: '02 54 00 00 00',
        email: 'mairie@lavilleauxclercs-fictif.fr',
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
        heroTitle: 'La Ville-aux-Clercs',
        heroSubtitle: 'Commune de Loir-et-Cher — Perche vendômois',
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
    where: { slug: { in: ['notre-commune', 'contact', 'vie-locale', 'demarches'] } },
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
            { label: 'Démarches', kind: 'page', page: pageBySlug['demarches'] },
            { label: 'Contact', kind: 'page', page: pageBySlug['contact'] },
          ],
        },
        { label: 'Actualités', kind: 'newsArchive' },
        { label: 'Agenda', kind: 'eventsArchive' },
        {
          label: 'Vie locale',
          kind: 'page',
          page: pageBySlug['vie-locale'],
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
        { label: 'Démarches', kind: 'page', page: pageBySlug['demarches'] },
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
      await payload.update({ collection: 'navigation', id: existing.docs[0].id, data: menu as any, overrideAccess: true })
      skipped++
      continue
    }

    await payload.create({ collection: 'navigation', data: menu as any, overrideAccess: true })
    inserted++
  }

  console.log(`[seed] navigation: ${inserted} inserted, ${skipped} skipped`)
}
