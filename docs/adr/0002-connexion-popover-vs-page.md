# Connexion via popover ancré, sans page dédiée

La page `/connexion` a été supprimée au profit d'un popover déclenché par une icône discrète dans le header. Le site est majoritairement public (citoyens qui ne se connectent jamais) ; afficher un lien "Se connecter" visible créerait une confusion inutile pour la quasi-totalité des visiteurs. Seuls les agents communaux et l'admin ont besoin de se connecter, principalement depuis un poste fixe — le popover desktop suffit, et le MobileMenu expose un lien texte discret en fallback.

## Considered Options

- **Page `/connexion` dédiée** — URL partageable, pas de JS requis, mais expose une action inutile à 99 % des visiteurs et impose une navigation sortante depuis n'importe quelle page.
- **Modal plein écran** — plus adapté mobile, mais les agents se connectent rarement sur mobile, et la modal ajoute un composant overlay sans bénéfice réel sur desktop.
- **Popover ancré (retenu)** — inline dans le header, se ferme au clic extérieur ou Escape, `router.refresh()` après succès pour rester sur la page courante.

## Consequences

- Si un utilisateur non authentifié tente `/admin`, le middleware redirige vers `/?auth=required` et un toast `sonner` s'affiche ("Vous devez être connecté pour accéder à cette page"). Le popover ne s'ouvre pas automatiquement — l'icône dans le header est suffisante.
- Les tests de `src/app/(frontend)/connexion/` sont supprimés ; la logique du formulaire est migrée vers le composant popover avec ses propres tests.
