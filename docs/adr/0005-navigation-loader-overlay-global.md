# ADR 0005 — Overlay de chargement global pour toutes les navigations

**Statut** : Accepté (2026-06-12)

## Contexte

Certaines navigations dans l'application (clic sur un résultat de recherche, clic sur un EditButton, soumission de formulaire) impliquent un fetch réseau côté serveur avant l'affichage de la nouvelle page. Sans feedback visuel, l'utilisateur peut croire que son clic n'a pas été pris en compte et cliquer plusieurs fois, ou s'interroger sur le bon fonctionnement de l'app.

## Décision

Implémenter un **overlay pleine page avec spinner centré** qui s'affiche sur toutes les navigations côté client, via un `NavigationContext` global placé dans le layout `(frontend)`.

L'overlay :
- apparaît après un délai de **200ms** (évite le flash pour les navigations rapides déjà en cache)
- bloque toute interaction pendant son affichage (`pointer-events-none` sur le reste)
- disparaît dès que `usePathname()` change (navigation terminée)
- se ferme de force après **10 secondes** (timeout de sécurité si la navigation échoue)

Deux mécanismes de déclenchement :
1. **Listener sur `document`** interceptant les clics sur les balises `<a>` — couvre tous les composants `<Link>` (dont EditButton) sans modification
2. **Fonction `navigate(url)`** exposée par le contexte — remplace les appels directs à `router.push()` dans `SearchModal` et le bouton Déconnexion de `HeaderClient`

Le layout `/admin` Payload n'est pas concerné.

## Alternatives considérées

**Barre de progression globale (NProgress)** : fine barre en haut de page, pattern répandu. Moins intrusif, mais moins visible — ne répond pas au besoin d'empêcher les doubles clics.

**Feedback local par composant** : chaque bouton gère son propre état `isPending`. Plus précis, mais nécessite d'instrumenter chaque point d'entrée individuellement, y compris EditButton qui est un Server Component.

**Overlay uniquement sur les `router.push` ciblés** : couvre les cas connus mais rate les futurs composants `<Link>` ajoutés sans y penser.

## Raisons du choix

- L'overlay + `pointer-events-none` résout le problème des doubles clics sur EditButton sans avoir à le convertir en Client Component.
- Le listener sur `<a>` couvre automatiquement tous les `<Link>` présents et futurs sans intervention par composant.
- Le délai de 200ms et le timeout de 10s encadrent les deux cas limites (navigation rapide, navigation bloquée).

## Conséquences

- Tous les appels directs à `router.push()` dans le périmètre `(frontend)` doivent passer par `navigate()` du contexte pour bénéficier de l'overlay.
- Le `NavigationContext` est un Client Component — il doit être ajouté comme wrapper dans `(frontend)/layout.tsx`.
- EditButton reste un Server Component sans modification.
