# Résultats du BAC – Madagascar

Site de consultation des résultats du Baccalauréat malgache. Statique, sans base de
données : toutes les données vivent dans des fichiers JSON embarqués au build.
SvelteKit (Svelte 5, runes) + SCSS, exécuté avec Bun, déployé sur Cloudflare (Workers / Pages).
Police auto-hébergée (Fontsource) : Poppins (400 à 700, sous-ensemble latin) partout.
Aucune bibliothèque d'UI ni de graphiques supplémentaire.

Site de démonstration indépendant (Ohayo Dev and Design), sans lien avec le ministère : les données sont fictives.

Fonctionnalités :

- **Vérifier mon résultat** : l'accueil se concentre sur la saisie du numéro (six cases, numéros de test
  par issue lus dans `examples`) et la
  session en chiffres ; le relevé s'ouvre en modale.
- **Recherche instantanée** par numéro ou nom/prénoms (insensible à la casse et aux accents, debounce).
- **Filtres** : série, province, observation (admis / 2e session / ajourné), mention, réunis
  derrière un bouton « Filtres » (popover ≥ 768 px, feuille en bas d'écran en dessous) ; les
  filtres actifs s'affichent en pastilles amovibles et vivent dans l'URL
  (`?serie=&province=&statut=&mention=`).
- **Relevé candidat** : modale accessible (`Esc`, focus piégé) sur la page d'accueil, et page
  autonome `/resultat/<annee>/<numero>` rendue côté serveur avec balises Open Graph (nom + statut),
  c'est l'URL utilisée par _Partager_ (Web Share, repli copie) et _Copier le lien_.
- **Relevé de notes** : `/resultat/<annee>/<numero>/releve`, feuille A4 (matière, coef., note,
  points, totaux, moyenne, mention, décision, QR vers le résultat, date). « Télécharger en PDF »
  ouvre l'impression (choisir « Enregistrer en PDF »). Filigrane diagonal « DONNÉES FICTIVES —
  DOCUMENT NON OFFICIEL » à l'écran et à l'impression ; ni nom de ministère, ni logo, sceau,
  signature ou drapeau.
- **Résultats par établissement** : `/etablissements/<annee>` classe les lycées par taux de
  réussite ; `?ecole=…` affiche la fiche d'un lycée et la liste de ses admis.
- **Raccourci** : `/` focalise la recherche.
- **Statistiques** : taux de réussite global, par série, par province, répartition des mentions
  (barres CSS, aucune lib de graphiques), repliables.
- **Exports** : PDF (impression navigateur de la liste filtrée) et CSV (`;`, UTF-8 BOM, prêt pour Excel).
- **Parcourir** : `/liste/<annee>` (recherche, filtres, exports) ; tableau à partir de 768 px,
  lignes compactes en dessous ; barre de filtres collante ; pagination (50 lignes/page).
  `?q=` pré-remplit la recherche, `?n=` ouvre un relevé.
- **Hors-ligne** : service worker (`src/service-worker.ts`) – assets pré-cachés, JSON des résultats
  en _stale-while-revalidate_. Un candidat peut rouvrir son résultat sans réseau.
- **Sélecteur d'année** : un fichier JSON par année.

## Lancer le projet

```bash
bun install
bun run dev        # http://localhost:5173
bun run check      # svelte-check
bun run build      # build de production (.svelte-kit/cloudflare)
bun run preview    # build + wrangler pages dev
```

## Données

### Emplacement

```
src/lib/data/
  2024.json
  2025.json
```

Chaque fichier = une année. Ils sont découverts automatiquement
(`import.meta.glob` dans `src/lib/server/data.ts`) : ajouter `2026.json` suffit à faire
apparaître l'année dans le sélecteur. Vite les découpe en chunks séparés, chargés à la demande.

### Schéma (`src/lib/types.ts`)

```jsonc
{
	"annee": 2025,
	"examen": "BAC",
	"session": "Session 2025",
	"generatedAt": "2025-07-25T08:00:00.000Z", // ISO 8601
	"total": 3200,
	// Matières et coefficients par série : [matière, coef]
	"matieres": {
		"D": [["Mathématiques", 4], ["SVT", 4], ["Physique-Chimie", 4], "…", ["EPS", 1]],
		"…": []
	},
	// Premier numéro de chaque issue (numéros de test affichés sur l'accueil)
	"examples": {
		"ajourné": "100523",
		"2e session": "102051",
		"passable": "102794",
		"assez bien": "101507",
		"bien": "100449",
		"très bien": "101170"
	},
	"results": [
		{
			"id": "2025-100449", // `${annee}-${numero}`, unique
			"numero": "100449", // numéro de candidat (6 chiffres)
			"nom": "ANDRIANTSOA",
			"prenoms": "Mamitiana Niaina",
			"serie": "D", // A1 | A2 | C | D | L | S | OSE | G
			"province": "Toliara", // Antananarivo | Toamasina | Fianarantsoa | Mahajanga | Toliara | Antsiranana
			"cisco": "Taolagnaro",
			"ecole": "Lycée Taolagnaro",
			"statut": "admis", // admis | 2e session | ajourné
			"mention": "bien", // très bien | bien | assez bien | passable | "" (non admis)
			"moyenne": 14.47, // /20
			// Notes /20 au quart de point, dans l'ordre de matieres[serie] ;
			// moyenne pondérée = moyenne (± 0,01)
			"notes": [13.75, 14, 15.25, 15.25, 12.5, 12.25, 15.75, 16.75, 15.75]
		}
	]
}
```

Les valeurs de `statut` et `mention` sont en minuscules : le CSS (`[data-result=…]`,
`[data-mention=…]`) et les filtres s'appuient dessus.

### Régénérer les données de démo

```bash
bun run data:generate              # 2024 (2 600 candidats) + 2025 (3 200)
bun run scripts/generate-data.ts 2026 4000   # une année, N candidats
```

Le générateur (`scripts/generate-data.ts`) est déterministe (PRNG seedé par l'année) :
même commande ⇒ même fichier. Les notes par matière utilisent un PRNG propre à chaque candidat
(seedé par l'année et le numéro) : les autres champs ne bougent pas quand on les régénère. Pour des données réelles, produire un JSON respectant le schéma
ci-dessus et le déposer dans `src/lib/data/`.

### API

| Requête                                   | Réponse                                |
| ----------------------------------------- | -------------------------------------- |
| `GET /api/results`                        | `{ annees, annee, totaux, examples }`  |
| `GET /api/results?annee=2025`             | le jeu de données complet (cache 24 h) |
| `GET /api/results?annee=2025&n=123456`    | un candidat, `404` sinon               |
| `GET /api/results?annee=2025&search=rako` | 20 premiers résultats correspondants   |

## Déploiement (Cloudflare)

```bash
bun run deploy     # build + wrangler pages deploy
```

La configuration est dans `wrangler.jsonc` (`nodejs_compat` activé pour `node:async_hooks`).
Aucune variable d'environnement ni binding n'est nécessaire : les données sont dans le bundle.

## Structure

```
scripts/generate-data.ts          générateur de données de démo
src/lib/data/*.json               données (une année par fichier)
src/lib/server/data.ts            chargement / recherche côté serveur
src/lib/types.ts                  types et listes de valeurs (séries, provinces…)
src/lib/stats.ts                  calcul des statistiques
src/lib/utils/{normalize,csv,share}.ts
src/lib/landing/                  hero (saisie du numéro), stats (la session en chiffres)
src/lib/utils/dataset.svelte.ts   chargement client d'une année (partagé accueil / liste)
src/lib/components/ResultCard.svelte  le relevé (modale et page autonome)
src/lib/components/Icon.svelte    icônes SVG intégrées (aucun appel réseau)
src/lib/components/table/         ResultsList, FilterBar, Pagination, Modal, PDFexport, CSVexport
src/routes/liste/[annee]          parcourir tous les résultats
src/routes/resultat/[annee]/[numero]  page autonome d'un résultat (SSR + Open Graph)
src/routes/resultat/[annee]/[numero]/releve  relevé de notes (A4, filigrané, imprimable)
src/routes/etablissements/[annee] résultats par lycée
src/routes/api/results/+server.ts endpoint JSON
src/service-worker.ts             cache hors-ligne
src/scss/                         styles (jetons dans _tokens.scss ; palette = thème daisyUI de app.css)
```
