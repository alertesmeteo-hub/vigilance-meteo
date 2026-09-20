# vigilance-meteo.alertes-meteo.com

Site de consultation des bulletins de vigilance météo France : bulletin du jour en temps réel, et archives depuis octobre 2001 (calendrier national et par département).

## Architecture

Ce projet ne fait **que lire** des données — l'import (temps réel toutes les heures + backfill historique 2001+) est fait par les scripts du projet [`claude-code-dictons`](https://github.com/alertesmeteo-hub/claude-code-dictons) (`cron-vigilance-meteo.ts`, `backfill-vigilance*.ts`), qui écrivent dans la même base MySQL `bijouxdealertes` via la même API PHP intermédiaire (`ovh-api/`, sur l'hébergement mutualisé OVH).

```
Ce site (Next.js, lecture seule)
   │  appels HTTPS (GET uniquement)
   ▼
ovh-api/ (déployé sur l'hébergement OVH — voir claude-code-dictons)
   ▼
MySQL bijouxdealertes
   ├─ vigilance_carte / vigilance_textes          (temps réel, toutes les heures)
   ├─ vigilance_national_jour                     (historique national, 2001+)
   └─ vigilance_departement_jour                   (historique par département, 2001+)
```

## Pages

| Route | Contenu |
|---|---|
| `/` | Bulletin de vigilance du jour (carte + texte), dernier passage |
| `/national` | Redirige vers le calendrier national du mois courant |
| `/national/AAAA/MM` | Calendrier national (couleur max du jour) |
| `/departement` | Sélecteur de département |
| `/departement/XX` | Redirige vers le calendrier du département, mois courant |
| `/departement/XX/AAAA/MM` | Calendrier du département XX |

## Sources des données (historique)

- **National (2001+)** : archive officielle [vigilance-public.meteo.fr](http://vigilance-public.meteo.fr/).
- **Par département (2001+)** : site tiers [vigiscript.fr](https://www.vigiscript.fr/Ancien_bulletin/) — **pas une source officielle Météo-France**, mais la meilleure approximation disponible (l'officiel n'existe qu'en images GIF pour cette période).
- **Par département (fin 2022+)** : archive officielle [data.gouv.fr](https://www.data.gouv.fr/datasets/vigilance-meteorologique-archivee) (plus fiable, à privilégier quand disponible — non distingué de la source précédente dans `vigilance_departement_jour` pour l'instant, même table).

## Installation

```bash
npm install
cp .env.example .env
# éditer .env : OVH_API_URL + OVH_API_TOKEN (mêmes valeurs que claude-code-dictons)
npm run dev
```

## Build production

```bash
npm run build
npm start
```

## Déploiement (VPS)

Même VPS Ubuntu que `dicton-du-jour` (PM2 + nginx), sur un port différent, avec un nouveau bloc nginx pour `vigilance-meteo.alertes-meteo.com` (TLS via certbot).
