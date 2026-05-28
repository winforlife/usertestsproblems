// api/generate-pdf.js
// Génère un rapport PDF personnalisé en mémoire (Buffer)
// Utilise @vercel/og ou jsPDF selon l'environnement Edge
// Pour Vercel Edge Functions, nous utilisons une approche HTML→PDF via Puppeteer
// ou plus simplement un rapport HTML inline (voir note ci-dessous)
//
// NOTE ARCHITECTURE :
// Vercel Edge Functions ne supportent pas les librairies Node.js comme pdfkit ou puppeteer.
// La solution la plus robuste pour un PDF sur Vercel est :
// Option A (recommandée) : générer un HTML riche envoyé par email — rendu parfait, zéro dépendance
// Option B : utiliser une API externe (htmlpdf.cloud, Gotenberg) pour convertir HTML→PDF
//
// Ce fichier implémente l'Option A + prépare l'Option B en commentaire.

import CONFIG from '../config/rapport.config.js';

const { palette, dimensions } = CONFIG;

// Score → couleur sémantique
function scoreColor(s) {
  if (s >= 3.5) return CONFIG.palette.green;
  if (s >= 2.5) return CONFIG.palette.gold;
  return "#C0392B";
}

// Barre de score HTML
function scoreBar(score, color) {
  const pct = Math.round((score / 5) * 100);
  return `
    <div style="height:6px;background:#E8E0D0;border-radius:3px;width:100%;margin-top:4px;">
      <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;"></div>
    </div>`;
}

// Radar SVG inline (simplifié, 6 axes)
function radarSVG(scores) {
  const n = 6, cx = 200, cy = 200, r = 130;
  const start = -Math.PI / 2, step = (2 * Math.PI) / n;
  const axIds = ["D1","D2","D3","D4","D5","D6"];
  const pt = (i, v) => {
    const a = start + i * step, d = (v / 5) * r;
    return [cx + d * Math.cos(a), cy + d * Math.sin(a)];
  };
  const poly = (pts) => pts.map((p, i) => `${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + "Z";

  const fullPts = axIds.map((_, i) => pt(i, 5));
  const devPts  = axIds.map((id, i) => pt(i, Math.min(5, (scores[id] || 0) + 1.5)));
  const curPts  = axIds.map((id, i) => pt(i, scores[id] || 0));
  const labelR  = r + 50;

  const labels = axIds.map((id, i) => {
    const a = start + i * step;
    const lx = cx + labelR * Math.cos(a), ly = cy + labelR * Math.sin(a);
    const col = dimensions[id].color;
    const name = dimensions[id].name.replace(" & ", "\n& ");
    const lines = name.split("\n");
    return lines.map((line, j) =>
      `<text x="${lx.toFixed(1)}" y="${(ly - (lines.length-1)*7 + j*14).toFixed(1)}" text-anchor="middle" font-size="11" font-family="Georgia" font-weight="bold" fill="${col}">${line}</text>`
    ).join("");
  }).join("");

  const dots = curPts.map(([px,py], i) => {
    const a = start + i * step;
    const s = scores[axIds[i]];
    const ox = Math.cos(a)*16, oy = Math.sin(a)*16;
    return `
      <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5" fill="${dimensions[axIds[i]].color}" stroke="white" stroke-width="1.5"/>
      <text x="${(px+ox).toFixed(1)}" y="${(py+oy+3).toFixed(1)}" text-anchor="middle" font-size="9" font-family="Georgia" font-weight="bold" fill="${dimensions[axIds[i]].color}">${s.toFixed(1)}</text>`;
  }).join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" style="width:100%;max-width:400px;display:block;margin:0 auto;">
  <path d="${poly(fullPts)}" fill="#EAF0F6" stroke="#B0C4D8" stroke-width="0.8"/>
  ${[1,2,3,4].map(lv => `<path d="${poly(axIds.map((_,i) => pt(i,lv)))}" fill="none" stroke="#D0DAE4" stroke-width="0.4"/>`).join("")}
  ${axIds.map((_,i) => { const [ex,ey]=pt(i,5); return `<line x1="${cx}" y1="${cy}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="#C8D4DC" stroke-width="0.5"/>`; }).join("")}
  <path d="${poly(devPts)}" fill="#CCE4F0BB" stroke="#4A90C0" stroke-width="1.2" stroke-dasharray="4 3"/>
  <path d="${poly(curPts)}" fill="#2E609033" stroke="#2E6090" stroke-width="2"/>
  ${dots}
  ${labels}
  <!-- Légende -->
  <rect x="4" y="${400-60}" width="12" height="8" fill="#EAF0F6" stroke="#B0C4D8" stroke-width="0.8"/>
  <text x="20" y="${400-54}" font-size="8" font-family="Georgia" fill="#7A8A9A">Potentiel théorique</text>
  <rect x="4" y="${400-46}" width="12" height="8" fill="#CCE4F0" stroke="#4A90C0" stroke-width="0.8" stroke-dasharray="3 2"/>
  <text x="20" y="${400-40}" font-size="8" font-family="Georgia" fill="#7A8A9A">Perspective</text>
  <rect x="4" y="${400-32}" width="12" height="8" fill="#2E609033" stroke="#2E6090" stroke-width="0.8"/>
  <text x="20" y="${400-26}" font-size="8" font-family="Georgia" fill="#7A8A9A">Votre position</text>
</svg>`;
}

// ── Générateur principal ───────────────────────────────────────────────────────
export function generateReportHTML({ nom, dob, profil, scores }) {
  const C = CONFIG;
  const P = C.profiles[profil] || C.profiles["dispersé"];
  const pal = C.palette;

  // Dimensions filtrées pro / perso
  const dimsPro   = Object.values(dimensions).filter(d => d.pro);
  const dimsPerso = Object.values(dimensions).filter(d => !d.pro);

  // Blocs constats
  const constatsHTML = Object.entries(dimensions).map(([id, dim]) => `
    <div style="margin-bottom:16px;">
      <div style="background:${dim.color};color:white;padding:8px 14px;border-radius:6px 6px 0 0;font-family:Georgia;font-size:13px;font-weight:700;">
        ${id} · ${dim.name} — ${(scores[id]||0).toFixed(1)} / 5
      </div>
      <div style="background:#FAFAF7;border:1px solid #E8E0D0;border-top:none;padding:12px 14px;border-radius:0 0 6px 6px;font-family:Georgia;font-size:13px;line-height:1.7;color:#2A1A08;font-style:italic;">
        ${P.constats[id] || ""}
      </div>
    </div>`).join("");

  // Pistes pro
  const pistesProHTML = Object.entries(P.pistes_pro || {}).map(([id, piste]) => `
    <div style="margin-bottom:14px;display:flex;gap:0;">
      <div style="background:${dimensions[id].color};width:6px;min-width:6px;border-radius:4px 0 0 4px;"></div>
      <div style="background:#F8F5F0;flex:1;padding:12px 16px;border:1px solid #E0D8C8;border-left:none;border-radius:0 6px 6px 0;">
        <div style="font-family:Georgia;font-size:12px;font-weight:700;color:${dimensions[id].color};margin-bottom:4px;">${id} · ${dimensions[id].name}</div>
        <div style="font-family:Georgia;font-size:13px;line-height:1.65;color:#3A2010;font-style:italic;">${piste}</div>
      </div>
    </div>`).join("");

  // Pistes perso
  const pistesPersoHTML = Object.entries(P.pistes_perso || {}).map(([id, piste]) => `
    <div style="margin-bottom:14px;display:flex;gap:0;">
      <div style="background:${dimensions[id].color};width:6px;min-width:6px;border-radius:4px 0 0 4px;"></div>
      <div style="background:#F8F5F0;flex:1;padding:12px 16px;border:1px solid #E0D8C8;border-left:none;border-radius:0 6px 6px 0;">
        <div style="font-family:Georgia;font-size:12px;font-weight:700;color:${dimensions[id].color};margin-bottom:4px;">${id} · ${dimensions[id].name}</div>
        <div style="font-family:Georgia;font-size:13px;line-height:1.65;color:#3A2010;font-style:italic;">${piste}</div>
      </div>
    </div>`).join("");

  // Scores résumé
  const scoresHTML = Object.entries(dimensions).map(([id, dim]) => {
    const s = scores[id] || 0;
    const col = scoreColor(s);
    return `
      <tr style="border-bottom:1px solid #E8E0D0;">
        <td style="padding:10px 14px;font-family:Georgia;font-size:12px;font-weight:700;color:${dim.color};">${id}</td>
        <td style="padding:10px 14px;font-family:Georgia;font-size:13px;color:#0D1A2B;">${dim.name} <span style="color:#7A8A9A;font-size:11px;">· ${dim.pro ? "Pro" : "Perso"}</span></td>
        <td style="padding:10px 14px;width:120px;">${scoreBar(s, col)}</td>
        <td style="padding:10px 14px;font-family:Georgia;font-size:16px;font-weight:700;color:${col};">${s.toFixed(1)}</td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>The Game of Life — Rapport ${nom}</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Georgia,serif; background:#FAFAF7; color:#1A1A1A; }
    .page { max-width:720px; margin:0 auto; padding:0 0 60px; }
    h1 { font-size:28px; color:${pal.deep}; font-weight:700; text-align:center; margin-bottom:8px; }
    h2 { font-size:18px; color:${pal.blue}; font-weight:700; margin:32px 0 12px; }
    p  { font-size:14px; line-height:1.8; color:#2C2018; margin-bottom:12px; }
    .italic { font-style:italic; color:${pal.warm}; }
    .rule { border:none; border-bottom:1px solid ${pal.rule}; margin:20px 0; }
    .section-tag { text-align:center; font-size:10px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:${pal.rule}; margin-bottom:8px; }
    table { width:100%; border-collapse:collapse; }
  </style>
</head>
<body>
<div class="page">

  <!-- COUVERTURE -->
  <div style="background:${pal.deep};padding:40px 32px;text-align:center;border-bottom:3px solid ${pal.rule};">
    <div style="color:${pal.rule};font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;">${C.brand.name}</div>
    <div style="color:#7A8A9A;font-size:13px;font-style:italic;margin-bottom:16px;">${C.cover.supra} · ${nom} · ${new Date().toLocaleDateString('fr-FR',{year:'numeric',month:'long'})}</div>
    <div style="color:white;font-size:32px;font-weight:700;line-height:1.2;margin-bottom:8px;">${C.cover.title}</div>
    <div style="color:#8BA8C0;font-size:14px;margin-bottom:20px;">${C.cover.subtitle}</div>
    <div style="display:inline-block;background:rgba(196,164,106,0.15);border:1px solid ${pal.rule};border-radius:20px;padding:8px 20px;">
      <span style="color:${pal.rule};font-size:14px;font-weight:700;font-style:italic;">${P.label}</span>
    </div>
  </div>

  <div style="padding:32px;">

    <!-- INTRO -->
    <div class="section-tag">Ce rapport</div>
    <hr class="rule">
    <p>${C.intro.paragraph1}</p>
    <p>${C.intro.paragraph2}</p>
    <p class="italic">${C.intro.note}</p>
    <hr class="rule">
    <p style="font-size:11px;color:#7A8A9A;font-style:italic;text-align:center;">Confidentiel · Usage personnel uniquement · ${C.brand.name} · ${C.brand.year}</p>

    <div style="height:32px;"></div>

    <!-- SECTION I -->
    <h1>${C.sectionI.title}</h1>
    <hr class="rule">
    <p>${C.sectionI.intro1}</p>
    <p>${C.sectionI.intro2}</p>

    <!-- Domaines -->
    <div style="display:flex;gap:12px;margin:20px 0;">
      <div style="flex:1;background:${pal.blue};border-radius:8px;padding:16px;">
        <div style="color:white;font-size:14px;font-weight:700;margin-bottom:4px;">${C.sectionI.pro.title.replace('\n',' ')}</div>
        <div style="color:#D0E4F8;font-size:12px;font-style:italic;margin-bottom:8px;">${C.sectionI.pro.axes}</div>
        <div style="color:#E8F0F8;font-size:12px;line-height:1.6;">${C.sectionI.pro.body}</div>
      </div>
      <div style="flex:1;background:${pal.purple};border-radius:8px;padding:16px;">
        <div style="color:white;font-size:14px;font-weight:700;margin-bottom:4px;">${C.sectionI.perso.title.replace('\n',' ')}</div>
        <div style="color:#D8D0F0;font-size:12px;font-style:italic;margin-bottom:8px;">${C.sectionI.perso.axes}</div>
        <div style="color:#EDE8F8;font-size:12px;line-height:1.6;">${C.sectionI.perso.body}</div>
      </div>
    </div>

    <!-- 6 dimensions -->
    <h2>Les six dimensions en détail</h2>
    ${Object.values(dimensions).map(dim => `
      <div style="margin-bottom:10px;">
        <div style="display:flex;gap:0;">
          <div style="background:${dim.color};color:white;font-weight:700;font-size:12px;padding:8px 10px;border-radius:6px 0 0 0;min-width:40px;text-align:center;">${dim.id}</div>
          <div style="background:#F2EFE8;flex:1;padding:8px 14px;border-radius:0 6px 0 0;font-weight:700;font-size:13px;color:${pal.deep};">${dim.name}</div>
        </div>
        <div style="background:#FAFAF7;border:1px solid #D8D0C0;border-top:none;padding:10px 14px;border-radius:0 0 6px 6px;font-size:13px;line-height:1.65;color:#2A1A08;">${dim.desc}</div>
      </div>`).join("")}

    <div style="height:32px;"></div>

    <!-- SECTION II -->
    <h1>Votre Cartographie</h1>
    <hr class="rule">
    <p>${C.sectionII.intro1}</p>
    <p>${C.sectionII.intro2}</p>

    <!-- Radar SVG -->
    <div style="margin:24px 0;text-align:center;">
      ${radarSVG(scores)}
    </div>

    <!-- Scores -->
    <h2>Scores par dimension</h2>
    <table style="margin-bottom:16px;">
      ${scoresHTML}
    </table>

    <!-- Profil -->
    <div style="background:#EBF3FA;border-left:4px solid ${pal.blue};border-radius:8px;padding:16px 20px;margin:16px 0;">
      <div style="font-size:11px;color:#7A8A9A;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Profil identifié</div>
      <div style="font-size:18px;font-weight:700;color:${pal.deep};font-style:italic;">${P.label}</div>
      <div style="font-size:13px;color:${pal.warm};line-height:1.7;margin-top:8px;font-style:italic;">${P.description}</div>
    </div>

    <div style="height:32px;"></div>

    <!-- SECTION III — directly after profil, no Analyse section -->
    <h1>Perspectives de Développement</h1>
    <hr class="rule">
    <p>${C.sectionIII.intro}</p>
    <p class="italic">${C.sectionIII.note}</p>

    <h2>Registre professionnel</h2>
    <p>${C.sectionIII.pro_intro}</p>
    ${pistesProHTML}

    <h2>Registre personnel</h2>
    <p>${C.sectionIII.perso_intro}</p>
    ${pistesPersoHTML}

    <div style="height:32px;"></div>

    <!-- PAGE FINALE -->
    <hr class="rule">
    <h1>${C.finale.title}</h1>
    <hr style="border:none;border-bottom:1px solid #D8CFC0;margin:12px 0 20px;">
    <p>${C.finale.paragraph1}</p>
    <p>${C.finale.paragraph2}</p>
    <p class="italic">${C.finale.italic}</p>

    <!-- CTA -->
    <div style="background:${pal.deep};border-radius:10px;padding:24px;border-top:3px solid ${pal.rule};margin-top:24px;">
      <div style="color:white;font-size:16px;font-weight:700;margin-bottom:10px;">${C.finale.cta_title}</div>
      <p style="color:#C8D8E8;font-size:13px;font-style:italic;margin-bottom:16px;">${C.finale.cta_body}</p>
      <a href="mailto:${C.brand.email}" style="display:inline-block;background:${pal.blue};color:white;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:700;">${C.finale.cta_button} →</a>
    </div>

    <p style="text-align:center;font-size:11px;color:#7A8A9A;font-style:italic;margin-top:24px;">${C.brand.name} · ${C.brand.author} · ${C.brand.year} · Confidentiel</p>
  </div>
</div>
</body>
</html>`;
}
