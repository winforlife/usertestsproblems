// Source unique des couleurs et tokens visuels TheNewGOL.
// Importé par App.jsx et tout composant.
// NE JAMAIS hardcoder une couleur hex ailleurs que dans ce fichier.

export const COLORS = {
  // Marque TheNewGOL — palette sombre
  deep:    "#0D1B2E",   // fond sombre principal
  navy:    "#0F2035",   // fond secondaire / cartes
  navyDk:  "#0A1520",   // fond body
  navyBd:  "#162A45",   // bordures sur fond sombre
  gold:    "#C8973A",   // accent doré TheNewGOL
  goldLt:  "#E8B84B",   // gold hover / highlight
  cream:   "#F7F3EE",   // texte chaud sur fond sombre
  white:   "#FFFFFF",
  grey:    "#8A9AAA",   // texte secondaire
  muted:   "#4A6080",   // texte tertiaire
  error:   "#E55050",   // erreur

  // Dimensions — UNIQUEMENT pour radar SVG et barres de score
  D1: "#3A7BD5",
  D2: "#00B4A6",
  D3: "#27AE60",
  D4: "#8E44AD",
  D5: "#F39C12",
  D6: "#E74C3C",

  // Fonds sélectionnés (rgba — passent le check hex)
  D1_sel: "rgba(58,123,213,0.18)",
  D2_sel: "rgba(0,180,166,0.18)",
  D3_sel: "rgba(39,174,96,0.18)",
  D4_sel: "rgba(142,68,173,0.18)",
  D5_sel: "rgba(243,156,18,0.18)",
  D6_sel: "rgba(231,76,60,0.18)",
};

export const FONTS = {
  display: "'Cormorant Garamond', serif",
  body:    "'Montserrat', sans-serif",
};

export const RADII = {
  card:   0,
  button: 0,
  badge:  0,
  small:  0,
};

export default COLORS;
