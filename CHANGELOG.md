# CHANGELOG — The Game of Life · Questionnaire

Format : `[Date] — [Fichier(s)] — Description`

---

## 2026-05-04
- `src/App.jsx` — 30 questions ordre mixé, 9 profils avec genre, nouvelle palette joyeuse
- `src/App.jsx` — Staging mode IS_PROD (2 questions en dev, 30 en prod)
- `src/App.jsx` — Masque DOB jj/mm/aaaa, inputMode numeric
- `src/App.jsx` — Suppression badges dimension pendant le quiz
- `src/App.jsx` — Formulaire final simplifié : "Recevez votre rapport" + CTA "Explorer ces pistes →"
- `api/send-report.js` — Sujet email "The Game of Life - Votre Cartographie 🚀✨"
- `api/generate-pdf.js` — Suppression labels Section I/II/III, suppression "Analyse des résultats"
- `api/generate-pdf.js` — Scores sans /5, passage direct vers Perspectives
- `config/rapport.config.js` — Palette mise à jour : D6 rouge corail #E74C3C
- `package.json` — Ajout script build:dev pour Lovable
- `src/design-tokens.js` — Création fichier source unique des couleurs
- `check-tokens.js` — Script de vérification cohérence avant merge

## 2026-05-03
- `src/App.jsx` — Nouvelle palette joyeuse (D1 bleu vif, D2 turquoise, D3 vert, D4 violet, D5 ambre)
- `src/App.jsx` — Questions mixées, suppression badges dimension
- `src/App.jsx` — 6 questions supplémentaires (une par dimension)
- `src/App.jsx` — 9 profils matrice niveau × tension, déclinaison genre m/f

## 2026-05-02
- `src/App.jsx` — Version initiale : 24 questions, 3 profils, toile d'araignée 3 couches
- `api/send-report.js` — Envoi email utilisateur + copie admin via Resend
- `api/generate-pdf.js` — Génération rapport HTML personnalisé
- `config/rapport.config.js` — Fichier éditorial : textes, couleurs, profils
