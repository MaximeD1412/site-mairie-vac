# Glossaire du domaine

## Rôles utilisateurs

**Admin**
Utilisateur avec accès complet à `/admin` Payload. Gère la structure du site : Pages, Navigation, EventCategories, ElectedOfficials, Associations, SiteSettings, MairieInfo, HomepageSettings, Users. Il n'y a qu'un seul admin (ou très peu).

**Agent communal**
Agent municipal désigné, non-formé techniquement. Gère uniquement le contenu éditorial (News, Events, Documents) via l'**Espace agents** — jamais via `/admin` Payload. Authentifié via le même système Payload (rôle `agent`), mais bloqué de `/admin`.

---

## Interfaces

**Espace agents**
Interface Next.js custom (routes sous `/espace-agents`) destinée aux agents communaux. Contient des formulaires simplifiés pour créer et modifier News, Events, Documents. Utilise les Server Actions Next.js avec le Local API Payload. Inclut un éditeur Tiptap avec médiathèque et insertion de documents.

**Panel admin**
L'interface `/admin` de Payload CMS, réservée à l'admin. Personnalisée avec le branding de la commune (couleurs, logo) et un dashboard d'accueil sur mesure.

---

## Collections éditoriales (Espace agents)

**News** (Actualités)
Créées et modifiées par les agents via l'Espace agents. Le champ `content` stocke du HTML (pas du JSON Lexical) pour compatibilité avec Tiptap.

**Events** (Agenda)
Créés et modifiés par les agents via l'Espace agents. Le champ `description` stocke du HTML.

**Documents**
Uploadés et gérés par les agents via l'Espace agents.

---

## Collections structurelles (Panel admin)

**Pages**, **Navigation**, **EventCategories**, **ElectedOfficials**, **Associations**, **SiteSettings**, **MairieInfo**, **HomepageSettings**, **Users** — accessibles uniquement via le Panel admin par l'Admin.

---

## Éditeur agent

Éditeur Tiptap intégré dans l'Espace agents. Fonctionnalités : gras, italique, titres, listes, upload image, sélecteur médiathèque Payload, insertion de documents avec les comportements suivants :

| Type de fichier | Comportement dans l'éditeur |
|---|---|
| PDF | Lien texte custom OU viewer PDF inline |
| Vidéo (MP4, etc.) | Lecteur vidéo HTML5 inline |
| Autres | Lien texte custom (téléchargement) |
