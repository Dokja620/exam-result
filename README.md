# Résultats du BAC – Madagascar

Site de consultation des résultats du Baccalauréat malgache. Statique, sans base de
données : toutes les données vivent dans des fichiers JSON embarqués au build.
SvelteKit (Svelte 5, runes) + SCSS, exécuté avec Bun, déployé sur Cloudflare (Workers / Pages).

Fonctionnalités :

- **Vérifier mon résultat** : saisie du numéro de candidat dans le hero → fiche directe.
- **Recherche instantanée** par numéro ou nom/prénoms (insensible à la casse et aux accents, debounce).
- **Filtres** : série, province, observation (admis / 2e session / ajourné), mention.
- **Fiche candidat** (modal accessible : `Esc`, focus piégé, bouton Fermer) avec **URL partageable**
  `/?annee=2025&n=123456`, bouton _Partager_ (Web Share, repli copie) et _Copier le lien_.
- **Statistiques** : taux de réussite global, par série, par province, répartition des mentions
  (barres CSS, aucune lib de graphiques).
- **Exports** : PDF (impression navigateur de la liste filtrée) et CSV (`;`, UTF-8 BOM, prêt pour Excel).
- **Pagination** (50 lignes/page) pour rester fluide avec plusieurs milliers de candidats.
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
			"moyenne": 14.47 // /20
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
même commande ⇒ même fichier. Pour des données réelles, produire un JSON respectant le schéma
ci-dessus et le déposer dans `src/lib/data/`.

### API

| Requête                                   | Réponse                                |
| ----------------------------------------- | -------------------------------------- |
| `GET /api/results`                        | `{ annees, annee, totaux }`            |
| `GET /api/results?annee=2025`             | le jeu de données complet (cache 24 h) |
| `GET /api/results?annee=2025&n=123456`    | un candidat, `404` sinon               |
| `GET /api/results?annee=2025&search=rako` | 20 premiers résultats correspondants   |

## Déploiement (Cloudflare)

```bash
bun run deploy     # build + wrangler pages deploy
```

La configuration est dans `wrangler.jsonc`. Aucune variable d'environnement ni binding
n'est nécessaire : les données sont dans le bundle.

## Structure

```
scripts/generate-data.ts          générateur de données de démo
src/lib/data/*.json               données (une année par fichier)
src/lib/server/data.ts            chargement / recherche côté serveur
src/lib/types.ts                  types et listes de valeurs (séries, provinces…)
src/lib/stats.ts                  calcul des statistiques
src/lib/utils/{normalize,csv,share}.ts
src/lib/landing/                  hero (quickCheck), stats, table
src/lib/components/table/         FilterBar, Pagination, Modal, PDFexport, CSVexport
src/routes/api/results/+server.ts endpoint JSON
src/service-worker.ts             cache hors-ligne
src/scss/                         styles (variables dans shared/_var.scss)
```
