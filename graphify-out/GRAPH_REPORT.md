# Graph Report - .  (2026-06-11)

## Corpus Check
- 215 files · ~118,873 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1009 nodes · 1623 edges · 104 communities (55 shown, 49 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 112 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Block Rendering System|Block Rendering System]]
- [[_COMMUNITY_Content Forms & URL Routing|Content Forms & URL Routing]]
- [[_COMMUNITY_Payload Admin Interface|Payload Admin Interface]]
- [[_COMMUNITY_News Pages & Role-gated UI|News Pages & Role-gated UI]]
- [[_COMMUNITY_Site Shell & Auth UI|Site Shell & Auth UI]]
- [[_COMMUNITY_Architecture & Ops Docs|Architecture & Ops Docs]]
- [[_COMMUNITY_Production Dependencies|Production Dependencies]]
- [[_COMMUNITY_Event CRUD Actions|Event CRUD Actions]]
- [[_COMMUNITY_Agenda Calendar Display|Agenda Calendar Display]]
- [[_COMMUNITY_Page Layout Blocks|Page Layout Blocks]]
- [[_COMMUNITY_Event Display Components|Event Display Components]]
- [[_COMMUNITY_Dev Tooling Dependencies|Dev Tooling Dependencies]]
- [[_COMMUNITY_Joomla Migration Crawler|Joomla Migration Crawler]]
- [[_COMMUNITY_Database Schema Migrations|Database Schema Migrations]]
- [[_COMMUNITY_Homepage & Frontend Shell|Homepage & Frontend Shell]]
- [[_COMMUNITY_News CRUD Actions|News CRUD Actions]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_CRUD Frontend Pages|CRUD Frontend Pages]]
- [[_COMMUNITY_Block Component Tests|Block Component Tests]]
- [[_COMMUNITY_Server Action Auth Concepts|Server Action Auth Concepts]]
- [[_COMMUNITY_Custom Block Editor|Custom Block Editor]]
- [[_COMMUNITY_Document CRUD Actions|Document CRUD Actions]]
- [[_COMMUNITY_Event Category System|Event Category System]]
- [[_COMMUNITY_Migration Pipeline Concepts|Migration Pipeline Concepts]]
- [[_COMMUNITY_Auth & Middleware|Auth & Middleware]]
- [[_COMMUNITY_Demo Seed Functions|Demo Seed Functions]]
- [[_COMMUNITY_Document Library Modal|Document Library Modal]]
- [[_COMMUNITY_Media Library Modal|Media Library Modal]]
- [[_COMMUNITY_TipTap Rich Editor|TipTap Rich Editor]]
- [[_COMMUNITY_Page Integration Tests|Page Integration Tests]]
- [[_COMMUNITY_Deployment Infrastructure|Deployment Infrastructure]]
- [[_COMMUNITY_Rich Editor Tests|Rich Editor Tests]]
- [[_COMMUNITY_Auth Page Tests|Auth Page Tests]]
- [[_COMMUNITY_Design System & Accessibility|Design System & Accessibility]]
- [[_COMMUNITY_Modifier Page Tests|Modifier Page Tests]]
- [[_COMMUNITY_Composable Block System ADR|Composable Block System ADR]]
- [[_COMMUNITY_Gallery Block|Gallery Block]]
- [[_COMMUNITY_Payload API Routes|Payload API Routes]]
- [[_COMMUNITY_CRUD Page Tests|CRUD Page Tests]]
- [[_COMMUNITY_Contact Form|Contact Form]]
- [[_COMMUNITY_Backup Configuration|Backup Configuration]]
- [[_COMMUNITY_Leaflet Map Component|Leaflet Map Component]]
- [[_COMMUNITY_Block Type System|Block Type System]]
- [[_COMMUNITY_Payload CMS Config|Payload CMS Config]]
- [[_COMMUNITY_Page Test Mocks|Page Test Mocks]]
- [[_COMMUNITY_Production Init Seed|Production Init Seed]]
- [[_COMMUNITY_Block Editor Tests|Block Editor Tests]]
- [[_COMMUNITY_Button Block Component|Button Block Component]]
- [[_COMMUNITY_Image Block Component|Image Block Component]]
- [[_COMMUNITY_Map Block Component|Map Block Component]]
- [[_COMMUNITY_Form Test Utilities|Form Test Utilities]]
- [[_COMMUNITY_Seed Strategy|Seed Strategy]]
- [[_COMMUNITY_Payload GraphQL API|Payload GraphQL API]]
- [[_COMMUNITY_Panneau Pocket Block|Panneau Pocket Block]]
- [[_COMMUNITY_Quick Links Block|Quick Links Block]]
- [[_COMMUNITY_News Detail Page|News Detail Page]]
- [[_COMMUNITY_Document Category Tests|Document Category Tests]]
- [[_COMMUNITY_Email Integration|Email Integration]]
- [[_COMMUNITY_Login Popover ADR|Login Popover ADR]]
- [[_COMMUNITY_Joomla Crawl Output|Joomla Crawl Output]]
- [[_COMMUNITY_CMS Dynamic Pages|CMS Dynamic Pages]]
- [[_COMMUNITY_Production Script|Production Script]]
- [[_COMMUNITY_Slug & Redirect Utilities|Slug & Redirect Utilities]]
- [[_COMMUNITY_Calendar Grid Tests|Calendar Grid Tests]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Accordion Block Schema|Accordion Block Schema]]
- [[_COMMUNITY_Button Block Schema|Button Block Schema]]
- [[_COMMUNITY_Collection List Block Schema|Collection List Block Schema]]
- [[_COMMUNITY_Contact Block Schema|Contact Block Schema]]
- [[_COMMUNITY_Gallery Block Schema|Gallery Block Schema]]
- [[_COMMUNITY_Image Block Schema|Image Block Schema]]
- [[_COMMUNITY_Map Block Schema|Map Block Schema]]
- [[_COMMUNITY_Panneau Pocket Block Schema|Panneau Pocket Block Schema]]
- [[_COMMUNITY_Quick Links Block Schema|Quick Links Block Schema]]
- [[_COMMUNITY_Button Block Test|Button Block Test]]
- [[_COMMUNITY_Columns Block Test|Columns Block Test]]
- [[_COMMUNITY_Contact Block Test|Contact Block Test]]
- [[_COMMUNITY_Gallery Block Test|Gallery Block Test]]
- [[_COMMUNITY_Image Block Test|Image Block Test]]
- [[_COMMUNITY_Map Block Test|Map Block Test]]
- [[_COMMUNITY_YouTube Feature|YouTube Feature]]
- [[_COMMUNITY_Document Categories Constant|Document Categories Constant]]
- [[_COMMUNITY_News Archive Page|News Archive Page]]
- [[_COMMUNITY_Calendar Date Utility Tests|Calendar Date Utility Tests]]
- [[_COMMUNITY_Published Access Control|Published Access Control]]
- [[_COMMUNITY_Generic Seed Collection|Generic Seed Collection]]
- [[_COMMUNITY_Dev Demo Seed|Dev Demo Seed]]
- [[_COMMUNITY_Globals Seed|Globals Seed]]
- [[_COMMUNITY_Navigation Seed|Navigation Seed]]
- [[_COMMUNITY_Pages Seed|Pages Seed]]
- [[_COMMUNITY_Users Seed|Users Seed]]
- [[_COMMUNITY_Jest DOM Setup|Jest DOM Setup]]
- [[_COMMUNITY_Vitest Smoke Test|Vitest Smoke Test]]
- [[_COMMUNITY_AuthToast Test|AuthToast Test]]
- [[_COMMUNITY_Slugify Tests|Slugify Tests]]
- [[_COMMUNITY_TS Config JSON|TS Config JSON]]
- [[_COMMUNITY_CSS Module Declaration|CSS Module Declaration]]

## God Nodes (most connected - your core abstractions)
1. `getPayloadClient()` - 60 edges
2. `decodePayloadToken()` - 31 edges
3. `YouTubeNode` - 18 edges
4. `Pages` - 16 edges
5. `compilerOptions` - 16 edges
6. `BlockEditor()` - 13 edges
7. `Media` - 11 edges
8. `PreviewBlocks()` - 11 edges
9. `MiniCalendar()` - 11 edges
10. `PROJECT.md — Project Overview` - 11 edges

## Surprising Connections (you probably didn't know these)
- `PostCSS Config (Tailwind)` --references--> `Next.js App Router`  [INFERRED]
  postcss.config.mjs → PROJECT.md
- `AuthToast()` --semantically_similar_to--> `BlockEditor()`  [AMBIGUOUS] [semantically similar]
  src/components/AuthToast.tsx → src/components/BlockEditor.tsx
- `Next.js Config (withPayload)` --references--> `Next.js App Router`  [EXTRACTED]
  next.config.mjs → PROJECT.md
- `Next.js Config (withPayload)` --references--> `Payload CMS`  [EXTRACTED]
  next.config.mjs → PROJECT.md
- `Package.json — commune-next-payload-starter` --references--> `Seed scripts (demo + init production)`  [EXTRACTED]
  package.json → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Production Infrastructure Stack (OVH VPS + Docker Compose + Caddy + PostgreSQL + S3 Backup)** — concept_ovh_vps, concept_docker_compose, concept_caddy, concept_postgresql, concept_ovh_s3, backup_backup_sh [EXTRACTED 1.00]
- **Dual Editorial Interface (Espace Agents vs Panel Admin) by Role** — concept_espace_agents, concept_panel_admin, concept_role_agent, concept_role_admin, adr_0001 [EXTRACTED 1.00]
- **Block-based Content Rendering Pipeline (BlockEditor → Payload layout → RenderBlocks → Next.js)** — concept_blockeditor, concept_payload_cms, concept_render_blocks, concept_nextjs [INFERRED 0.85]
- **Infrastructure Docker Stack (OVH VPS + Compose + PostgreSQL + Backup)** — spec_infra_ovh, plan_infra_ovh_docker, concept_docker_compose_4services [EXTRACTED 1.00]
- **Agenda Redesign Flow (spec → plan → carousel + calendar + lib)** — spec_agenda_homepage, plan_agenda_homepage, concept_agenda_carousel, concept_mini_calendar [EXTRACTED 0.95]
- **Detail Page TDD Pattern (presentational component + route + tests)** — concept_event_article_component, concept_news_article_component, plan_agenda_detail, plan_news_detail [INFERRED 0.85]
- **Server Actions Auth Guard Pattern (documents, events, news)** — actions_documents_assert_agent_or_admin, actions_events_assert_agent_or_admin, actions_news_assert_agent_or_admin [EXTRACTED 0.95]
- **Payload Collections Seeded by Demo Script** — src_seed_seed_users, src_seed_seed_events, src_seed_seed_pages, src_seed_seed_globals [EXTRACTED 1.00]
- **News CRUD Server Actions and Test Coverage** — actions_news_create_news, actions_news_update_news, actions_news_delete_news [EXTRACTED 1.00]
- **Auth-Guarded Mutation Pages (admin/agent role check)** — actualites_new_newsnewpage, agenda_new_eventnewpage, agenda_slug_modifier_eventmodifierpage, documents_new_documentnewpage, documents_modifier_documentmodifierpage [EXTRACTED 0.95]
- **Payload CMS API Routes (REST + GraphQL)** — api_slug_restroute, api_graphql_graphqlroute, api_graphqlplayground_graphqlplaygroundroute [EXTRACTED 0.95]
- **Agenda CRUD Page Set** — agenda_eventsarchive, agenda_slug_eventdetailpage, agenda_new_eventnewpage, agenda_slug_modifier_eventmodifierpage [INFERRED 0.90]
- **All CMS Blocks Registered in Pages Layout Field** — collections_pages_pages, blocks_richtextblock_richtextblock, blocks_imageblock_imageblock, blocks_quicklinksblock_quicklinksblock, blocks_collectionlistblock_collectionlistblock, blocks_panneaupocketblock_panneaupocketblock, blocks_contactblock_contactblock, blocks_galleryblock_galleryblock, blocks_accordionblock_accordionblock, blocks_mapblock_mapblock, blocks_buttonblock_buttonblock [EXTRACTED 1.00]
- **Collections Protected by isAgentOrAdmin Access Control** — src_access_isagentorAdmin, collections_associations_associations, collections_documents_documents, collections_electedofficials_electedofficials, collections_eventcategories_eventcategories, collections_events_events, collections_media_media, collections_news_news, collections_pages_pages [EXTRACTED 1.00]
- **BlockEditor Drag-and-Drop Architecture (DndContext + SortableContext + SortableBlock)** — components_blockeditor_blockeditor, components_blockeditor_sortableblock, components_blockeditor_columnsblockeditor [EXTRACTED 0.95]
- **Header Navigation System (Server + Client + Mobile)** — components_header_header, components_headerclient_headerclient, components_mobilemenu_mobilemenu [EXTRACTED 0.95]
- **Content Forms with Live Preview (NewsForm + EventForm + BlockEditor + PreviewModal)** — components_newsform_newsform, components_eventform_eventform, components_blockeditor_blockeditor, components_previewmodal_previewmodal [EXTRACTED 0.95]
- **Rich Editor Media Insertion (RichEditor + MediaLibraryModal + DocumentLibraryModal)** — components_richeditor_richeditor, components_medialibrarymodal_medialibrarymodal, components_documentlibrarymodal_documentlibrarymodal [EXTRACTED 0.95]
- **Forms with Slug Auto-generation and BlockEditor Layout** — tests_eventform_test, tests_newsform_test, concept_slug_autogeneration, concept_blockeditor_layout_serialization [INFERRED 0.90]
- **Admin Branding Components (Icon, Logo, Dashboard)** — admin_icon_adminicon, admin_logo_adminlogo, admin_dashboard_admindashboard, concept_admin_branding [EXTRACTED 0.95]
- **Modal Accessibility Pattern (Escape, aria-modal, dialog role)** — tests_documentlibrarymodal_test, tests_medialibrarymodal_test, tests_loginpopover_test, concept_modal_escape_pattern, concept_aria_accessibility [INFERRED 0.90]
- **Event Display Components (Card, Article, Carousel)** — events_eventcard_eventcard, events_eventarticle_eventarticle, home_agendacarousel_agendacarousel [INFERRED 0.90]
- **Block Component Test Suites** — __tests___accordionblock_test_accordionblock_test, __tests___buttonblock_test_buttonblock_test, __tests___collectionlistblock_test_collectionlistblock_test, __tests___columnsblock_test_columnsblock_test, __tests___contactblock_test_contactblock_test, __tests___galleryblock_test_galleryblock_test, __tests___imageblock_test_imageblock_test, __tests___mapblock_test_mapblock_test, __tests___panneaupocketblock_test_panneaupocketblock_test, __tests___quicklinksblock_test_quicklinksblock_test, __tests___richtextblock_test_richtextblock_test [EXTRACTED 1.00]
- **PanneauPocket Block and Home Section Integration** — blocks_panneaupocketblock_panneaupocketblock, home_actuplanneausection_actuplanneausection, concept_panneaupocket_integration [INFERRED 0.90]
- **Payload CMS Admin-Configurable Global Settings** — globals_homepagesettings_homepagesettings, globals_mairieinfo_mairieinfo, globals_sitesettings_sitesettings [EXTRACTED 0.95]
- **Calendar Grid + Indicator Computation + Render Flow** — lib_calendar_buildcalendargrid, lib_calendar_getweekindicators, home_minicalendar_minicalendar [EXTRACTED 0.95]
- **YouTube Embed Feature (Node + Client + Server)** — youtube_youtubenode_youtubenode, youtube_feature_client_youtubefeatureclient, youtube_feature_server_youtubefeature [EXTRACTED 0.95]
- **Chronological Migration Chain (Initial→EventCategories→NewBlocks→HTML→Layout→Logo)** — migrations_20260519_initial_schema, migrations_20260521_event_categories, migrations_20260602_new_blocks, migrations_20260604_news_events_html, migrations_20260605_layout_json, migrations_20260606_site_settings_logo [EXTRACTED 1.00]
- **Lexical JSON → HTML → Layout Block Migration Pipeline** — migrations_20260604_news_events_html, migrations_20260604_lexical_to_html_fn, migrations_20260605_layout_json [EXTRACTED 0.95]
- **Library Unit Test Suite (auth, calendar, documents)** — lib_tests_auth_test_resolve_middleware_redirect_tests, lib_tests_calendar_test_build_calendar_grid_tests, lib_tests_documents_test_document_categories_tests [INFERRED 0.85]

## Communities (104 total, 49 thin omitted)

### Community 0 - "Block Rendering System"
Cohesion: 0.06
Nodes (47): PanneauPocketBlock Test Suite, QuickLinksBlock Test Suite, AccordionBlock, ButtonBlock, CollectionListBlock, ContactBlock, GalleryBlock, ImageBlock (+39 more)

### Community 1 - "Content Forms & URL Routing"
Cohesion: 0.05
Nodes (53): EventFormState, NewsFormState, buildCategoryUrl(), buildUrl(), EventsArchive(), EventForm(), parseLayout(), Props (+45 more)

### Community 2 - "Payload Admin Interface"
Cohesion: 0.06
Nodes (20): AdminIcon(), importMap, AdminLogo(), Payload Admin Page, Admin Branding (LVC SVG Logo), Lexical Custom Node Pattern, Args, Payload Root Layout (+12 more)

### Community 3 - "News Pages & Role-gated UI"
Cohesion: 0.07
Nodes (29): NewsArchive(), EditButton(), EditButtonProps, Variant, variantClass, EditButton Role-Based Auth (admin/agent), Role-Gated Rendering (admin/agent), DocumentsArchive() (+21 more)

### Community 4 - "Site Shell & Auth UI"
Cohesion: 0.07
Nodes (31): AuthToast(), Footer(), FooterNavData, FooterProps, MairieInfoData, NavItem, OpeningHour, Header() (+23 more)

### Community 5 - "Architecture & Ops Docs"
Cohesion: 0.10
Nodes (41): ADR 0001 — Espace agents custom vs Payload admin, backup.sh — pg_dump to S3, Cadrage agent IA — Payload block-based editing, pg_dump backup rotation (daily/weekly/monthly), Block-based CMS page composition pattern, BlockEditor — Block-based content composer (dnd-kit + Tiptap), Caddy — reverse proxy with automatic HTTPS, Docker Compose infrastructure (Caddy + app + postgres + backup) (+33 more)

### Community 6 - "Production Dependencies"
Cohesion: 0.05
Nodes (39): dependencies, @aws-sdk/client-s3, cross-env, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, dotenv, graphql (+31 more)

### Community 7 - "Event CRUD Actions"
Cohesion: 0.11
Nodes (21): assertAgentOrAdmin(), createEvent(), deleteEvent(), updateEvent(), AdminDashboard(), SHORTCUTS, AssociationsArchive(), CollectionListBlockProps (+13 more)

### Community 8 - "Agenda Calendar Display"
Cohesion: 0.12
Nodes (28): Calendar Event Indicator (Dot/Bar) Pattern, AgendaCarousel(), CarouselCategory, CarouselEvent, CarouselImage, DAY_FMT, SLIDE_H, TIME_FMT (+20 more)

### Community 9 - "Page Layout Blocks"
Cohesion: 0.08
Nodes (27): Column, ColumnsBlock(), ColumnsBlockProps, RenderBlocks(), ALLOWED_ATTRS, ALLOWED_STYLES, ALLOWED_TAGS, HtmlContent() (+19 more)

### Community 10 - "Event Display Components"
Cohesion: 0.09
Nodes (26): EventArticle Test Suite, EventCard Test Suite, Category Color Badge Pattern, Event Date Formatting (Paris Timezone), DAY_FMT, EventArticle(), EventArticleProps, EventCategory (+18 more)

### Community 11 - "Dev Tooling Dependencies"
Cohesion: 0.06
Nodes (30): devDependencies, drizzle-kit, jsdom, tailwindcss, @tailwindcss/postcss, @testing-library/dom, @testing-library/jest-dom, @testing-library/react (+22 more)

### Community 12 - "Joomla Migration Crawler"
Cohesion: 0.14
Nodes (26): Joomla Site Crawler (migration content inventory), classifyFileType(url) — internal, classifyPage(url, html), classifyFileType(), classifyPage(), DOC_EXTS, ext(), extractFiles() (+18 more)

### Community 13 - "Database Schema Migrations"
Cohesion: 0.10
Nodes (7): esc(), lexicalToHtml(), renderChildren(), renderNode(), renderText(), up(), migrations

### Community 14 - "Homepage & Frontend Shell"
Cohesion: 0.10
Nodes (20): Ongoing Events Calendar Query Fix (endDate >= now), Frontend Root Layout (Header/Footer/Nav), HomePage(), ActuPanneauSection(), Hero(), HeroImage, HeroProps, HeroSettings (+12 more)

### Community 15 - "News CRUD Actions"
Cohesion: 0.18
Nodes (13): assertAgentOrAdmin(), createNews(), deleteNews(), updateNews(), decodePayloadToken(), NewsModifierPage(), DocumentNewPage(), NewsNewPage() (+5 more)

### Community 16 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 17 - "CRUD Frontend Pages"
Cohesion: 0.17
Nodes (18): NewsNewPage Component, NewsNewPage Test, NewsArchive Page Test, EventsArchive Page, EventNewPage Component, EventNewPage Test, EventDetailPage Component, EventModifierPage Component (+10 more)

### Community 18 - "Block Component Tests"
Cohesion: 0.17
Nodes (12): AccordionBlock Test Suite, CollectionListBlock Test Suite, RichTextBlock Test Suite, AccordionItem, HEADING_CLASS, LexicalNode, renderNode(), renderText() (+4 more)

### Community 19 - "Server Action Auth Concepts"
Cohesion: 0.15
Nodes (17): assertAgentOrAdmin (documents), createDocument Server Action, deleteDocument Server Action, updateDocument Server Action, assertAgentOrAdmin (events), createEvent Server Action, deleteEvent Server Action, updateEvent Server Action (+9 more)

### Community 20 - "Custom Block Editor"
Cohesion: 0.16
Nodes (13): Block, BlockContent(), BlockEditorProps, ColumnDef, ColumnsBlock, ColumnsBlockEditor(), ImageBlock, LeafBlock (+5 more)

### Community 21 - "Document CRUD Actions"
Cohesion: 0.25
Nodes (11): assertAgentOrAdmin(), createDocument(), deleteDocument(), DocumentFormState, updateDocument(), CATEGORIES, DocumentForm(), Props (+3 more)

### Community 22 - "Event Category System"
Cohesion: 0.20
Nodes (15): AgendaCarousel Client Component (peek pattern, auto-advance), calendar.ts — Pure Functions (buildCalendarGrid, getWeekIndicators), EventArticle Presentational Component (TDD), EventCategories Collection (name, slug, color), MiniCalendar Client Component (dot/bar indicators per category), NewsArticle Presentational Component (TDD), Seed Idempotence (check par slug avant insert), Plan — Agenda Detail Page /agenda/[slug] (+7 more)

### Community 23 - "Migration Pipeline Concepts"
Cohesion: 0.32
Nodes (12): Event Category Enum to Relation Refactor, Lexical JSON to HTML to Layout Block Pipeline, Payload CMS Up/Down Migration Pattern, Initial Database Schema Migration, Event Categories Migration (enum→table), New Page Blocks Migration (contact, button, map, accordion, gallery), lexicalToHtml Converter, Lexical JSON to HTML Migration (+4 more)

### Community 24 - "Auth & Middleware"
Cohesion: 0.21
Nodes (6): resolveMiddlewareRedirect(), mockCookies, mockDecodePayloadToken, config, middleware(), Middleware Route Matcher Config

### Community 25 - "Demo Seed Functions"
Cohesion: 0.26
Nodes (8): richText(), seedAssociations(), seedCollection(), seedElectedOfficials(), seedEventCategories(), seedEvents(), seedNews(), seedPages()

### Community 26 - "Document Library Modal"
Cohesion: 0.22
Nodes (8): DocumentFile, DocumentInsertMode, DocumentItem, DocumentLibraryModal(), DocumentLibraryModalProps, RichEditor(), Document Insert Modes (link, pdf-viewer, video), mockDocs

### Community 27 - "Media Library Modal"
Cohesion: 0.22
Nodes (5): MediaDoc, MediaLibraryModalProps, ARIA Accessibility Pattern (dialog, aria-modal, aria-expanded), Modal Escape Key Close Pattern, MEDIA_DOCS

### Community 28 - "TipTap Rich Editor"
Cohesion: 0.29
Nodes (6): RichEditorProps, SANITIZE_OPTIONS, ToolbarButtonProps, Tiptap Custom Node Extension Pattern, DocumentPdfViewer, DocumentVideoPlayer

### Community 29 - "Page Integration Tests"
Cohesion: 0.18
Nodes (3): mockGetPayloadClient, mockNotFound, mockGetPayloadClient

### Community 30 - "Deployment Infrastructure"
Cohesion: 0.36
Nodes (9): Docker Compose — 4 Services (caddy, app, postgres, backup), Docker Dev WSL2 Native Filesystem (hot reload sans polling), GitHub Actions Deploy Workflow (SSH → VPS), OVH Object Storage (médias + backups pg_dump), Migration SQLite → PostgreSQL (adaptateur Payload), Plan — Docker Clean Environment (dev/prod split), Plan — Infrastructure OVH VPS + Docker + PostgreSQL, Spec — Docker Dev Setup (hot reload WSL2) (+1 more)

### Community 31 - "Rich Editor Tests"
Cohesion: 0.25
Nodes (7): RichEditor TipTap Integration, DocumentInsertMode, mockEditor, mockGetHTML, mockIsActive, mockRun, OnUpdateArgs

### Community 32 - "Auth Page Tests"
Cohesion: 0.25
Nodes (5): mockCookies, mockDecodePayloadToken, mockGetPayloadClient, mockNotFound, existingEvent

### Community 33 - "Design System & Accessibility"
Cohesion: 0.48
Nodes (7): Homepage Sections Layout (Hero + QuickLinks + Actu + Agenda + Publications + Footer), RGAA Accessibility Requirements (skip link, aria, contraste), Design Tokens Tailwind v4 (@theme), Option C — Template Fixe + Données CMS (architecture homepage), Session Notes — UI/Design System Implementation 2026-05-07, Plan — UI Design System Homepage Implementation, Spec — UI Design System La Ville-aux-Clercs

### Community 34 - "Modifier Page Tests"
Cohesion: 0.29
Nodes (5): mockCookies, mockDecodePayloadToken, mockGetPayloadClient, mockNotFound, existingNews

### Community 35 - "Composable Block System ADR"
Cohesion: 0.47
Nodes (6): ADR 0003 — BlockEditor Composable pour News et Events, Système de Blocs Composables (remplace Tiptap monolithique), Blocks.tsx Dispatcher Pattern (blockType routing), Lexical → JSX Custom Converter (renderNode recursive), Plan — Block Renderer Implementation, Spec — Block Renderer Design

### Community 36 - "Gallery Block"
Cohesion: 0.33
Nodes (4): GalleryBlockProps, GalleryItem, Lightbox, MediaValue

### Community 37 - "Payload API Routes"
Cohesion: 0.33
Nodes (5): DELETE, GET, OPTIONS, PATCH, POST

### Community 38 - "CRUD Page Tests"
Cohesion: 0.33
Nodes (3): mockCookies, mockDecodePayloadToken, mockGetPayloadClient

### Community 40 - "Backup Configuration"
Cohesion: 0.40
Nodes (4): AWS_ACCESS_KEY_ID, AWS_DEFAULT_REGION, AWS_SECRET_ACCESS_KEY, backup.sh script

### Community 41 - "Leaflet Map Component"
Cohesion: 0.40
Nodes (3): LeafletMap(), LeafletMapProps, OpenStreetMap TileLayer Integration

### Community 42 - "Block Type System"
Cohesion: 0.60
Nodes (5): Block Type Union (RichTextBlock | ImageBlock | VideoBlock | ColumnsBlock), BlockEditor(), MediaLibraryModal(), BlockEditor Test Suite, ColumnsBlock Test Suite

### Community 43 - "Payload CMS Config"
Cohesion: 0.40
Nodes (5): Payload Generated Types (Config Interface), Admin Custom Components (Logo, Icon, Dashboard), Payload CMS Build Config, PostgreSQL Adapter, S3 Storage Plugin (Conditional)

### Community 46 - "Block Editor Tests"
Cohesion: 0.40
Nodes (4): emptyBlocks, imageBlock, richTextBlock, videoBlock

### Community 51 - "Seed Strategy"
Cohesion: 0.50
Nodes (4): Dual Seed Strategy (dev demo vs prod init), runSeedInit (Production Init Seed), seed.init.ts Entry Point, Production Seed: No Fake Data

### Community 52 - "Payload GraphQL API"
Cohesion: 0.67
Nodes (3): Payload GraphQL Route Handler, Payload GraphQL Playground Route Handler, Payload REST API Route Handler

### Community 55 - "News Detail Page"
Cohesion: 1.00
Nodes (3): generateMetadata for News Detail, News Detail Page (/actualites/[slug]), NewsDetailPage Tests

### Community 56 - "Document Category Tests"
Cohesion: 0.67
Nodes (3): DOCUMENT_CATEGORIES Tests, getAvailableTabs Tests, getCategoryLabel Tests

## Ambiguous Edges - Review These
- `AuthToast()` → `BlockEditor()`  [AMBIGUOUS]
  src/components/AuthToast.tsx · relation: semantically_similar_to
- `slugify function` → `resolveMiddlewareRedirect Tests`  [AMBIGUOUS]
  src/lib/slugify.ts · relation: semantically_similar_to

## Knowledge Gaps
- **399 isolated node(s):** `backup.sh script`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `nextConfig` (+394 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `AuthToast()` and `BlockEditor()`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `slugify function` and `resolveMiddlewareRedirect Tests`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `getPayloadClient()` connect `Event CRUD Actions` to `Block Rendering System`, `Content Forms & URL Routing`, `Modifier Page Tests`, `News Pages & Role-gated UI`, `Site Shell & Auth UI`, `Auth Page Tests`, `CRUD Page Tests`, `Contact Form`, `Event Display Components`, `Page Test Mocks`, `Homepage & Frontend Shell`, `News CRUD Actions`, `Document CRUD Actions`, `Page Integration Tests`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `decodePayloadToken()` connect `News CRUD Actions` to `Auth Page Tests`, `Modifier Page Tests`, `News Pages & Role-gated UI`, `Site Shell & Auth UI`, `CRUD Page Tests`, `Event CRUD Actions`, `Document CRUD Actions`, `Auth & Middleware`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `importMap` connect `Payload Admin Interface` to `CRUD Frontend Pages`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `getPayloadClient()` (e.g. with `HomepageSettings` and `MairieInfo`) actually correct?**
  _`getPayloadClient()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `decodePayloadToken()` (e.g. with `DocumentModifierPage()` and `EventModifierPage()`) actually correct?**
  _`decodePayloadToken()` has 6 INFERRED edges - model-reasoned connections that need verification._