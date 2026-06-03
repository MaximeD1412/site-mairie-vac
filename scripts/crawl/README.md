# Script de crawl — migration Joomla

Crawle un site Joomla public, télécharge les fichiers et génère un inventaire CSV des pages.

## Prérequis

Node.js ≥ 22 (supporte TypeScript natif). Aucune dépendance supplémentaire à installer.

## Utilisation

```bash
node --experimental-strip-types scripts/crawl/index.ts <URL> [dossier-de-sortie]
```

**Exemples :**

```bash
# Sortie dans ./crawl-output (défaut)
node --experimental-strip-types scripts/crawl/index.ts https://www.macommune.fr

# Sortie dans un dossier personnalisé
node --experimental-strip-types scripts/crawl/index.ts https://www.macommune.fr ./migration
```

## Outputs

```
crawl-output/
├── pages-inventory.csv   ← inventaire de toutes les pages crawlées
├── pdf/                  ← tous les PDF trouvés sur le site
├── images/               ← toutes les images (jpg, png, svg…)
└── docs/                 ← autres documents (docx, xlsx, odt…)
```

### `pages-inventory.csv`

| url | title | type |
|-----|-------|------|
| https://macommune.fr/ | Accueil — Ma Commune | accueil |
| https://macommune.fr/contact | Contact | contact |
| https://macommune.fr/actualites | Actualités | page |

Sert de checklist pour la réécriture manuelle du contenu dans Payload CMS.

## Comportement

- **Réexécutable** : les fichiers déjà téléchargés ne sont pas re-téléchargés.
- **Périmètre** : seules les pages du même domaine que l'URL racine sont crawlées.
- **Fichiers détectés** : liens `<a href>` et attributs `<img src>` pointant vers des fichiers.
