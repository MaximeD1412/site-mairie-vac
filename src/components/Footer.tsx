export function Footer() {
  return (
    <footer className="bg-teal-950 text-white mt-20">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="text-lg font-bold">Mairie de La Ville-aux-Clercs</h2>
          <p className="mt-3 text-teal-50">Adresse, horaires et coordonnées à compléter dans les paramètres du site.</p>
        </div>
        <div>
          <h2 className="text-lg font-bold">Accès rapides</h2>
          <ul className="mt-3 space-y-2 text-teal-50"><li>Contact</li><li>Publications</li><li>Agenda</li></ul>
        </div>
        <div>
          <h2 className="text-lg font-bold">Accessibilité</h2>
          <p className="mt-3 text-teal-50">Prévoir déclaration d’accessibilité, mentions légales et politique de confidentialité.</p>
        </div>
      </div>
    </footer>
  )
}
