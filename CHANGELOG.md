# CHANGELOG — The New Game of Life · Questionnaire

Format : `[Date] — [Fichier(s)] — Description`

---

## 2026-06-04
- `src/design-tokens.js` — Palette TheNewGOL : deep navy #0D1B2E, gold #C8973A, Cormorant Garamond + Montserrat, RADII tous à 0
- `src/App.jsx` — Rebrand complet TheNewGOL : fond sombre, gold #C8973A, polices Cormorant + Montserrat, border-radius zéro partout
- `src/App.jsx` — Échelle Likert 3 niveaux → 5 niveaux : Tout à fait / Plutôt / Neutre / Plutôt pas / Pas du tout d'accord
- `src/App.jsx` — Airtable save-per-answer : sessionId + chaîne de promesses sérialisée
- `src/App.jsx` — sessionId + recordId passés à send-report pour mise à jour Airtable finale
- `src/App.jsx` — Radar SVG : fond sombre, polygone doré, étiquettes Montserrat
- `src/App.jsx` — Rebrand "The New Game of Life" dans tous les textes UI
- `src/pages/api/saveanswer.js` — Nouvel endpoint Edge : créé/MAJ record GOL_Questionnaire par réponse
- `src/pages/api/connectors/airtable.js` — Connecteur Airtable Edge (createRecord, updateRecord)
- `src/pages/api/generate-pdf.js` — Template email TheNewGOL : fond sombre, gold, Montserrat, radar sombre, couleurs dimensions conservées
- `src/pages/api/send-report.js` — Sujet email rebrandé, template admin TheNewGOL, MAJ Airtable finale
- `config/rapport.config.js` — Palette TheNewGOL, couleurs dimensions alignées avec AXES App.jsx, brand TheNewGOL
- `index.html` — Correction typo, Google Fonts Cormorant + Montserrat, background #0D1B2E

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
