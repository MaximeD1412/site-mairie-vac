# ADR 0004 — Stockage "En rédaction" dans une collection Payload séparée et cachée

**Date :** 2026-06-12
**Statut :** Accepté

## Contexte

Le cycle de vie éditorial introduit un état "En rédaction" : un brouillon privé à l'auteur, invisible même pour l'admin, créé automatiquement par l'autosave. Il doit survivre à la fermeture du navigateur et être accessible depuis n'importe quel appareil.

## Décision

Stocker les enregistrements "En rédaction" dans une nouvelle collection Payload (`working-copies`) avec :
- `admin: { hidden: true }` — absente du Panel admin
- Accès lecture/écriture restreint à `req.user?.id === doc.author`
- Accessible uniquement via les routes de l'Espace agents (Local API avec `overrideAccess: false`)

## Alternatives écartées

**Payload `versions: { drafts: true }` seul** — Les drafts Payload sont visibles dans le Panel admin (l'admin peut accéder à toutes les collections avec `overrideAccess: true`). Ne satisfait pas l'invariant "invisible même pour l'admin".

**localStorage / sessionStorage** — Ne survit pas à un changement d'appareil. Un agent qui commence sur son PC et reprend sur mobile perdrait son travail.

## Conséquences

- La collection `working-copies` ne doit jamais apparaître dans le Panel admin ni dans aucune requête avec `overrideAccess: true`.
- Le passage de "En rédaction" à "Brouillon" ou "Publié" doit supprimer l'enregistrement `working-copies` correspondant.
- Les collections Events et News activent `versions: { drafts: true }` pour l'état "Brouillon" — migration nécessaire sur les données existantes.
