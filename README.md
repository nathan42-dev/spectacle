# Écran staff — Grand Spectacle (thème Puy du Fou)

Un système de régie complet pour spectacle historique en plein air, avec quatre écrans synchronisés en temps réel via Firebase Realtime Database :

| Fichier | Pour qui | Contenu |
|---|---|---|
| `display.html` | Régie / coulisses | Statut, minuteur, déroulé complet, cavalerie, pyro, radio, Wi-Fi, contact urgence |
| `loges.html` | Comédiens en loges | Statut, gros minuteur, prochaine entrée en scène — épuré, lisible de loin |
| `public.html` | Hall / accueil public | Statut en langage public, météo — **aucune info sensible** (pas de Wi-Fi, pas de contact interne) |
| `control.html` | Toi, sur ton téléphone | Pilote tous les écrans ci-dessus, protégé par un code d'accès |
| `config.js` | — | Config Firebase + code d'accès, **à modifier une seule fois**, utilisée par toutes les pages |
| `theme.css` | — | Le thème visuel partagé (pierre, bronze, parchemin, torches) |

Ta config Firebase est déjà en place dans `config.js`.

## 1. Code d'accès du contrôleur

Dans `config.js`, la constante `CONTROL_PIN` vaut actuellement `"PUYDUFOU"`. Change-la pour ce que tu veux — c'est demandé une fois par appareil (stocké le temps de la session du navigateur) avant de pouvoir piloter l'écran depuis `control.html`.

⚠️ Ce n'est pas une vraie sécurité (le code est visible si quelqu'un inspecte le fichier), juste un frein simple pour éviter qu'un lien égaré permette à n'importe qui de changer l'écran en direct. Si tu veux une vraie authentification plus tard, on peut ajouter Firebase Auth.

## 2. Règles de sécurité Firebase recommandées

```json
{
  "rules": {
    "concertScreen": {
      ".read": true,
      ".write": true
    }
  }
}
```

## 3. Déployer sur GitHub Pages

```bash
git init
git add .
git commit -m "Écran staff — grand spectacle"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/concert-staff.git
git push -u origin main
```

Puis Paramètres du repo → Pages → Source = branche `main`, dossier `/root`.

Tu obtiens :
- `.../display.html` → écran régie / coulisses (le principal, riche en infos techniques)
- `.../loges.html` → écran loges comédiens
- `.../public.html` → écran hall d'accueil / public
- `.../control.html` → ton téléphone, avec des liens rapides vers les trois écrans en haut de page

## Ce que pilote le téléphone (control.html)

- **État du spectacle** : avant spectacle / portes ouvertes / en cours / entracte / rappel / terminé — change instantanément la couleur et le libellé sur les trois écrans
- **Minuteur** : durée + libellé, avec une case à cocher "afficher aussi sur l'écran public" (utile pour un compte à rebours avant ouverture, sans exposer les minutages internes au public par défaut)
- **Annonce plein écran** : texte libre + couleur (or/pourpre/vert/bleu), 4 raccourcis pré-remplis pensés spectacle (cavalerie en place, pyro armée...), historique des 8 dernières annonces envoyées
- **Alerte d'urgence** : indépendante des annonces normales, avec son propre texte, son propre déclenchement, et surtout **son propre bouton pour la lever** — elle ne s'efface pas par erreur en effaçant une annonce classique
- **Prochainement** : ce qui s'affiche en régie et en loges comme prochain événement
- **Déroulé du spectacle** : lignes horaires avec cases "en cours" / "fait" par tableau — la ligne "en cours" est mise en valeur sur l'écran régie
- **Infos spectacle** : tombée de la nuit, plan de repli intempéries, statut cavalerie/animaux, statut pyrotechnie, nombre de figurants en scène, canal radio staff
- **Infos bandeau bas** : Wi-Fi staff, météo, contact urgence — affichées uniquement sur l'écran régie (pas sur l'écran public)

## Pourquoi trois écrans différents

Un spectacle type Puy du Fou tourne avec des équipes qui n'ont pas besoin des mêmes infos, et certaines infos (mot de passe Wi-Fi, contact urgence direct, statut pyro) n'ont rien à faire sous les yeux du public :

- **Régie** garde tout — c'est l'écran technique complet
- **Loges** ne garde que l'essentiel pour un comédien : statut, minuteur géant lisible de loin, prochaine entrée
- **Public** reformule le statut en langage accueillant, cache toute info interne, et n'affiche un minuteur que si tu l'actives explicitement pour le public

Les trois lisent la même donnée Firebase — pas besoin de tout ressaisir trois fois, tu pilotes une seule fois depuis `control.html`.

## Idées d'évolutions possibles

- Vraie authentification (Firebase Auth) si plusieurs personnes différentes doivent avoir des droits différents
- Écran dédié régie technique séparé (son/lumière/pyro) si l'écran régie actuel devient trop chargé
- Notification sonore sur l'écran loges quand une annonce est envoyée (utile si personne ne regarde l'écran en continu)
- Lier automatiquement le "prochainement" à la ligne "en cours" du déroulé plutôt que de le saisir à part
