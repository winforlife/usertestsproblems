// design-tokens.js
// Source unique des couleurs et tokens visuels.
// Importé par App.jsx, rapport.config.js et tout composant Lovable.
// NE JAMAIS hardcoder une couleur hex ailleurs que dans ce fichier.

export const COLORS = {
  // Marque
  deep:    "#0D1A2B",   // fond sombre, header
  gold:    "#C4A46A",   // accents dorés, filets
  warm:    "#5C3D0A",   // texte italique, corps chaud
  grey:    "#7A8A9A",   // texte secondaire
  pale:    "#FAFAF7",   // fond général

  // Dimensions
  D1: "#3A7BD5",        // Clarté stratégique — bleu vif
  D2: "#00B4A6",        // Énergie & alignement — turquoise
  D3: "#27AE60",        // Relation au collectif — vert frais
  D4: "#8E44AD",        // Rapport à soi — violet
  D5: "#F39C12",        // Sens & vision — ambre doré
  D6: "#E74C3C",        // Manifestation — rouge corail

  // Lights (fonds boutons sélectionnés)
  D1_light: "#EBF3FA",
  D2_light: "#E0F7F5",
  D3_light: "#E8F8EE",
  D4_light: "#F5EEF8",
  D5_light: "#FEF9E7",
  D6_light: "#FDEDEC",
};

export const FONTS = {
  primary: "Georgia, serif",
};

export const RADII = {
  card:   10,
  button: 6,
  badge:  20,
  small:  4,
};

export default COLORS;
