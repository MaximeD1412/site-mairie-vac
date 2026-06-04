# ADR 0001 — Interface custom pour les agents communaux plutôt que Payload admin simplifié

**Statut** : Accepté (2026-06-04)

## Contexte

Les agents communaux (non-formés techniquement) doivent pouvoir créer et modifier du contenu éditorial : Actualités, Événements, Documents. Deux approches ont été évaluées.

## Décision

Construire une interface Next.js custom sous `/espace-agents` plutôt que d'utiliser `/admin` Payload avec des vues simplifiées.

Les agents sont **bloqués de `/admin` Payload**. Leur seule entrée est l'Espace agents.

## Alternatives considérées

**Payload admin simplifié** : masquer les collections non-pertinentes, améliorer les labels, restreindre les accès. Moins de dev, mais l'interface Payload reste complexe (éditeur Lexical, blocs, slugs, versions) pour un utilisateur non-formé.

## Raisons du choix

- L'agent communal publie 2-3 actualités par semaine et ne doit pas être confronté à l'éditeur de blocs Lexical, aux slugs, aux versions de contenu, ni à la structure interne de Payload.
- Une interface dédiée peut auto-générer les slugs, masquer les champs techniques, et proposer un éditeur WYSIWYG adapté (Tiptap) avec médiathèque et insertion de documents.
- L'admin conserve un accès complet à Payload pour la structure du site.

## Conséquences

- Les champs `content` (News) et `description` (Events) passent de `type: 'richText'` (JSON Lexical) à un stockage HTML brut pour compatibilité avec Tiptap.
- Deux surfaces d'édition à maintenir : l'Espace agents et le Panel admin Payload.
- L'éditeur Tiptap doit inclure : upload image, sélecteur médiathèque Payload, insertion de documents (PDF viewer, vidéo inline, lien texte).
