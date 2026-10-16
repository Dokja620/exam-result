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
  c'est l'URL utilisée par le partage. Deux appels à l'action sur le relevé :
  _Obtenir mon relevé de notes_ (principal) et _Partager_, qui ouvre un menu (popover ≥ 768 px,
  feuille en bas d'écran en dessous) : partage natif si disponible (avec l'image générée au
  `<canvas>`, 1080 × 1350), WhatsApp, Facebook, _Télécharger l'image_ et _Copier le lien_
  (repli `execCommand` hors contexte sécurisé, ex. http sur le réseau local). Ctrl+P imprime le
  relevé sur une page A4 avec QR code et date.
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

| Requête                                   | Réponse                                         |
| ----------------------------------------- | ----------------------------------------------- |
| `GET /api/results`                        | `{ annees, annee, totaux, examples, versions }` |
| `GET /api/results?annee=2025`             | jeu de données compact, sans notes (ETag, 1 h)  |
| `GET /api/results?annee=2025&v=<version>` | idem, URL immuable (cache 1 an)                 |
| `GET /api/results?annee=2025&n=123456`    | un candidat (sans notes), `404` sinon           |
| `GET /api/results?annee=2025&search=rako` | 20 premiers résultats correspondants            |
| `GET /api/results?annee=2025&stats`       | statistiques de la session (accueil)            |

Le format compact (`src/lib/compact.ts`) est orienté colonnes : numéros en écarts successifs,
lycées / CISCO / séries / statuts / mentions en dictionnaires, moyenne × 100. Les notes par
matière restent côté serveur (le relevé de notes est rendu en SSR). `versions` donne l'empreinte
de chaque année : la liste charge `?annee=…&v=…`, mis en cache une fois pour toutes.

## Partage et référencement

Chaque page passe par `src/lib/components/Seo.svelte` : titre, description, `<link rel="canonical">`,
Open Graph (`og:title`, `og:description`, `og:image` 1200 × 630 avec dimensions et texte alternatif,
`og:url`, `og:type`, `og:site_name`, `og:locale`) et Twitter (`summary_large_image`). Les pages de
résultat et de relevé gardent `noindex` ; leur titre et leur description portent le nom, le statut et
la mention.

Les URL absolues partent de **`PUBLIC_SITE_URL`** (variable d'environnement lue à l'exécution,
`https://exam-results.ohayoprepa.mg` par défaut ; l'origine locale n'est utilisée qu'en
développement). L'image Docker la fixe avec `ENV` ; sur Cloudflare, la déclarer dans les variables
du projet si le domaine change.

Images Open Graph : `static/og/{home,liste,lycees}.png`, rendues dans le style v1 par
`bun run og:generate` (`scripts/og.py`, Playwright pour Python et Chromium requis).

## Déploiement (Cloudflare)

```bash
bun run deploy     # build + wrangler pages deploy
```

La configuration est dans `wrangler.jsonc` (`nodejs_compat` activé pour `node:async_hooks`).
Aucune variable d'environnement ni binding n'est nécessaire : les données sont dans le bundle.

## Docker

Image `oven/bun:1.4.2-alpine`, serveur SvelteKit autonome (`ADAPTER=node`), port 3000, utilisateur non root, healthcheck intégré.
Pages HTML et JSON de l'API compressés (brotli / gzip) par `src/hooks.server.ts`, assets statiques pré-compressés.
`PUBLIC_SITE_URL` (défaut : `https://exam-results.ohayoprepa.mg`) fixe l'origine des balises canoniques et Open Graph.

```bash
docker build -t exam-result .
docker run -p 3000:3000 exam-result
```

Sans `ADAPTER=node`, `bun run build` reste sur l'adaptateur Cloudflare.

## Structure

```
scripts/generate-data.ts          générateur de données de démo
scripts/og.py                     images Open Graph (static/og/)
src/lib/data/*.json               données (une année par fichier)
src/lib/server/data.ts            chargement / recherche côté serveur
src/lib/types.ts                  types et listes de valeurs (séries, provinces…)
src/lib/stats.ts                  calcul des statistiques
src/lib/utils/{normalize,csv,share}.ts
src/lib/landing/                  hero (saisie du numéro), stats (la session en chiffres)
src/lib/utils/dataset.svelte.ts   chargement client du jeu compact d'une année (liste)
src/lib/components/ResultCard.svelte  le relevé (modale et page autonome)
src/lib/components/Popover.svelte  panneau ancré / feuille mobile (filtres, partage)
src/lib/components/Qr.svelte      QR code (qrcode-generator, importé à la demande)
src/lib/utils/share-image.ts      image de partage au <canvas>
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

## Historique

- **v1** : [men-result](https://github.com/Dokja620/men-result) (Qwik, 2024), première version du
  site. Les couleurs, la police Poppins, les onglets du drapeau aux coins des cartes et le hero
  à confettis en viennent.
