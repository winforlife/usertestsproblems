// api/generate-pdf.js
// Génère le rapport HTML envoyé par email (Option A — HTML inline).
// Vercel Edge Functions ne supportent pas pdfkit/puppeteer — HTML email est la solution robuste.

import CONFIG from '../config/rapport.config.js';

const { palette, dimensions } = CONFIG;

// Score → couleur sémantique
function scoreColor(s) {
  if (s >= 3.5) return palette.green;
  if (s >= 2.5) return palette.gold;
  return palette.error;
}

// Barre de score HTML
function scoreBar(score, color) {
  const pct = Math.round((score / 5) * 100);
  return `
    <div style="height:5px;background:${palette.navyBd};width:100%;margin-top:4px;">
      <div style="height:100%;width:${pct}%;background:${color};"></div>
    </div>`;
}

// Radar SVG inline (6 axes) — fond sombre TheNewGOL
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
      `<text x="${lx.toFixed(1)}" y="${(ly - (lines.length-1)*7 + j*14).toFixed(1)}" text-anchor="middle" font-size="11" font-family="Montserrat,sans-serif" font-weight="700" fill="${col}">${line}</text>`
    ).join("");
  }).join("");

  const dots = curPts.map(([px,py], i) => {
    const a = start + i * step;
    const s = scores[axIds[i]];
    const ox = Math.cos(a)*16, oy = Math.sin(a)*16;
    return `
      <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5" fill="${dimensions[axIds[i]].color}" stroke="${palette.deep}" stroke-width="1.5"/>
      <text x="${(px+ox).toFixed(1)}" y="${(py+oy+3).toFixed(1)}" text-anchor="middle" font-size="9" font-family="Montserrat,sans-serif" font-weight="700" fill="${dimensions[axIds[i]].color}">${s.toFixed(1)}</text>`;
  }).join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" style="width:100%;max-width:400px;display:block;margin:0 auto;background:${palette.deep};">
  <path d="${poly(fullPts)}" fill="${palette.svgFullFill}" stroke="${palette.svgFullStroke}" stroke-width="0.8"/>
  ${[1,2,3,4].map(lv => `<path d="${poly(axIds.map((_,i) => pt(i,lv)))}" fill="none" stroke="${palette.svgGrid}" stroke-width="0.4"/>`).join("")}
  ${axIds.map((_,i) => { const [ex,ey]=pt(i,5); return `<line x1="${cx}" y1="${cy}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${palette.svgGrid}" stroke-width="0.5"/>`; }).join("")}
  <path d="${poly(devPts)}" fill="rgba(200,151,58,0.12)" stroke="${palette.gold}" stroke-width="1.2" stroke-dasharray="4 3"/>
  <path d="${poly(curPts)}" fill="rgba(200,151,58,0.22)" stroke="${palette.gold}" stroke-width="2"/>
  ${dots}
  ${labels}
  <rect x="4" y="${400-60}" width="12" height="8" fill="${palette.svgFullFill}" stroke="${palette.svgFullStroke}" stroke-width="0.8"/>
  <text x="20" y="${400-54}" font-size="8" font-family="Montserrat,sans-serif" fill="${palette.grey}">Potentiel théorique</text>
  <rect x="4" y="${400-46}" width="12" height="8" fill="rgba(200,151,58,0.12)" stroke="${palette.gold}" stroke-width="0.8" stroke-dasharray="3 2"/>
  <text x="20" y="${400-40}" font-size="8" font-family="Montserrat,sans-serif" fill="${palette.grey}">Perspective</text>
  <rect x="4" y="${400-32}" width="12" height="8" fill="rgba(200,151,58,0.22)" stroke="${palette.gold}" stroke-width="0.8"/>
  <text x="20" y="${400-26}" font-size="8" font-family="Montserrat,sans-serif" fill="${palette.grey}">Votre position</text>
</svg>`;
}

// ── Générateur principal ───────────────────────────────────────────────────────
export function generateReportHTML({ nom, dob, profil, scores }) {
  const C = CONFIG;
  const P = C.profiles[profil] || C.profiles["dispersé"];
  const pal = C.palette;

  const dimsPro   = Object.values(dimensions).filter(d => d.pro);
  const dimsPerso = Object.values(dimensions).filter(d => !d.pro);

  const constatsHTML = Object.entries(dimensions).map(([id, dim]) => `
    <div style="margin-bottom:16px;">
      <div style="background:${dim.color};color:${pal.white};padding:8px 14px;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;">
        ${id} · ${dim.name} — ${(scores[id]||0).toFixed(1)} / 5
      </div>
      <div style="background:${pal.navy};border:1px solid ${pal.navyBd};border-top:none;padding:12px 14px;font-family:Montserrat,sans-serif;font-size:13px;line-height:1.7;color:${pal.warm};font-style:italic;">
        ${P.constats[id] || ""}
      </div>
    </div>`).join("");

  const pistesProHTML = Object.entries(P.pistes_pro || {}).map(([id, piste]) => `
    <div style="margin-bottom:14px;display:flex;gap:0;">
      <div style="background:${dimensions[id].color};width:4px;min-width:4px;"></div>
      <div style="background:${pal.navy};flex:1;padding:12px 16px;border:1px solid ${pal.navyBd};border-left:none;">
        <div style="font-family:Montserrat,sans-serif;font-size:11px;font-weight:700;color:${dimensions[id].color};margin-bottom:4px;text-transform:uppercase;letter-spacing:0.08em;">${id} · ${dimensions[id].name}</div>
        <div style="font-family:Montserrat,sans-serif;font-size:13px;line-height:1.65;color:${pal.warm};font-style:italic;">${piste}</div>
      </div>
    </div>`).join("");

  const pistesPersoHTML = Object.entries(P.pistes_perso || {}).map(([id, piste]) => `
    <div style="margin-bottom:14px;display:flex;gap:0;">
      <div style="background:${dimensions[id].color};width:4px;min-width:4px;"></div>
      <div style="background:${pal.navy};flex:1;padding:12px 16px;border:1px solid ${pal.navyBd};border-left:none;">
        <div style="font-family:Montserrat,sans-serif;font-size:11px;font-weight:700;color:${dimensions[id].color};margin-bottom:4px;text-transform:uppercase;letter-spacing:0.08em;">${id} · ${dimensions[id].name}</div>
        <div style="font-family:Montserrat,sans-serif;font-size:13px;line-height:1.65;color:${pal.warm};font-style:italic;">${piste}</div>
      </div>
    </div>`).join("");

  const scoresHTML = Object.entries(dimensions).map(([id, dim]) => {
    const s = scores[id] || 0;
    const col = scoreColor(s);
    return `
      <tr style="border-bottom:1px solid ${pal.navyBd};">
        <td style="padding:10px 14px;font-family:Montserrat,sans-serif;font-size:11px;font-weight:700;color:${dim.color};">${id}</td>
        <td style="padding:10px 14px;font-family:Montserrat,sans-serif;font-size:13px;color:${pal.cream};">${dim.name} <span style="color:${pal.grey};font-size:11px;">· ${dim.pro ? "Pro" : "Perso"}</span></td>
        <td style="padding:10px 14px;width:120px;">${scoreBar(s, col)}</td>
        <td style="padding:10px 14px;font-family:Montserrat,sans-serif;font-size:16px;font-weight:700;color:${col};">${s.toFixed(1)}</td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>The New Game of Life — Rapport ${nom}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Montserrat:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Montserrat,sans-serif; background:${pal.deep}; color:${pal.cream}; }
    .page { max-width:720px; margin:0 auto; padding:0 0 60px; background:${pal.deep}; }
    h1 { font-family:'Cormorant Garamond',serif; font-size:28px; color:${pal.gold}; font-weight:700; text-align:center; margin-bottom:8px; }
    h2 { font-family:Montserrat,sans-serif; font-size:15px; color:${pal.gold}; font-weight:700; margin:32px 0 12px; text-transform:uppercase; letter-spacing:0.08em; }
    p  { font-size:14px; line-height:1.8; color:${pal.cream}; margin-bottom:12px; }
    .italic { font-style:italic; color:${pal.warm}; }
    .rule { border:none; border-bottom:1px solid ${pal.navyBd}; margin:20px 0; }
    .section-tag { text-align:center; font-size:10px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:${pal.gold}; margin-bottom:8px; }
    table { width:100%; border-collapse:collapse; background:${pal.navy}; }
  </style>
</head>
<body>
<div class="page">

  <!-- COUVERTURE -->
  <div style="background:${pal.deep};padding:40px 32px;text-align:center;border-bottom:3px solid ${pal.gold};">
    <div style="color:${pal.gold};font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;font-family:Montserrat,sans-serif;">${C.brand.name}</div>
    <div style="color:${pal.grey};font-size:13px;font-style:italic;margin-bottom:16px;font-family:Montserrat,sans-serif;">${C.cover.supra} · ${nom} · ${new Date().toLocaleDateString('fr-FR',{year:'numeric',month:'long'})}</div>
    <div style="color:${pal.white};font-size:32px;font-weight:700;line-height:1.2;margin-bottom:8px;font-family:'Cormorant Garamond',serif;">${C.cover.title}</div>
    <div style="color:${pal.grey};font-size:14px;margin-bottom:20px;font-family:Montserrat,sans-serif;">${C.cover.subtitle}</div>
    <div style="display:inline-block;background:rgba(200,151,58,0.12);border:1px solid ${pal.gold};padding:8px 20px;">
      <span style="color:${pal.gold};font-size:14px;font-weight:700;font-style:italic;font-family:Montserrat,sans-serif;">${P.label}</span>
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
    <p style="font-size:11px;color:${pal.grey};font-style:italic;text-align:center;">Confidentiel · Usage personnel uniquement · ${C.brand.name} · ${C.brand.year}</p>

    <div style="height:32px;"></div>

    <!-- SECTION I -->
    <h1>${C.sectionI.title}</h1>
    <hr class="rule">
    <p>${C.sectionI.intro1}</p>
    <p>${C.sectionI.intro2}</p>

    <!-- Domaines -->
    <div style="display:flex;gap:12px;margin:20px 0;">
      <div style="flex:1;background:${pal.blue};padding:16px;">
        <div style="color:${pal.white};font-size:13px;font-weight:700;margin-bottom:4px;font-family:Montserrat,sans-serif;">${C.sectionI.pro.title.replace('\n',' ')}</div>
        <div style="color:rgba(255,255,255,0.6);font-size:12px;font-style:italic;margin-bottom:8px;font-family:Montserrat,sans-serif;">${C.sectionI.pro.axes}</div>
        <div style="color:rgba(255,255,255,0.85);font-size:12px;line-height:1.6;font-family:Montserrat,sans-serif;">${C.sectionI.pro.body}</div>
      </div>
      <div style="flex:1;background:${pal.purple};padding:16px;">
        <div style="color:${pal.white};font-size:13px;font-weight:700;margin-bottom:4px;font-family:Montserrat,sans-serif;">${C.sectionI.perso.title.replace('\n',' ')}</div>
        <div style="color:rgba(255,255,255,0.6);font-size:12px;font-style:italic;margin-bottom:8px;font-family:Montserrat,sans-serif;">${C.sectionI.perso.axes}</div>
        <div style="color:rgba(255,255,255,0.85);font-size:12px;line-height:1.6;font-family:Montserrat,sans-serif;">${C.sectionI.perso.body}</div>
      </div>
    </div>

    <!-- 6 dimensions -->
    <h2>Les six dimensions en détail</h2>
    ${Object.values(dimensions).map(dim => `
      <div style="margin-bottom:10px;">
        <div style="display:flex;gap:0;">
          <div style="background:${dim.color};color:${pal.white};font-weight:700;font-size:12px;padding:8px 10px;min-width:40px;text-align:center;font-family:Montserrat,sans-serif;">${dim.id}</div>
          <div style="background:${pal.navyBd};flex:1;padding:8px 14px;font-weight:700;font-size:13px;color:${pal.cream};font-family:Montserrat,sans-serif;">${dim.name}</div>
        </div>
        <div style="background:${pal.navy};border:1px solid ${pal.navyBd};border-top:none;padding:10px 14px;font-size:13px;line-height:1.65;color:${pal.warm};font-family:Montserrat,sans-serif;">${dim.desc}</div>
      </div>`).join("")}

    <div style="height:32px;"></div>

    <!-- SECTION II -->
    <h1>Votre Cartographie</h1>
    <hr class="rule">
    <p>${C.sectionII.intro1}</p>
    <p>${C.sectionII.intro2}</p>

    <!-- Radar SVG -->
    <div style="margin:24px 0;text-align:center;background:${pal.deep};padding:16px;">
      ${radarSVG(scores)}
    </div>

    <!-- Scores -->
    <h2>Scores par dimension</h2>
    <table style="margin-bottom:16px;">
      ${scoresHTML}
    </table>

    <!-- Profil -->
    <div style="background:${pal.navy};border-left:4px solid ${pal.gold};padding:16px 20px;margin:16px 0;">
      <div style="font-size:10px;color:${pal.grey};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;font-family:Montserrat,sans-serif;">Profil identifié</div>
      <div style="font-size:18px;font-weight:700;color:${pal.gold};font-style:italic;font-family:'Cormorant Garamond',serif;">${P.label}</div>
      <div style="font-size:13px;color:${pal.warm};line-height:1.7;margin-top:8px;font-style:italic;font-family:Montserrat,sans-serif;">${P.description}</div>
    </div>

    <div style="height:32px;"></div>

    <!-- SECTION III -->
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
    <hr style="border:none;border-bottom:1px solid ${pal.navyBd};margin:12px 0 20px;">
    <p>${C.finale.paragraph1}</p>
    <p>${C.finale.paragraph2}</p>
    <p class="italic">${C.finale.italic}</p>

    <!-- CTA -->
    <div style="background:${pal.navy};padding:24px;border-top:3px solid ${pal.gold};margin-top:24px;">
      <div style="color:${pal.white};font-size:16px;font-weight:700;margin-bottom:10px;font-family:'Cormorant Garamond',serif;">${C.finale.cta_title}</div>
      <p style="color:${pal.warm};font-size:13px;font-style:italic;margin-bottom:16px;">${C.finale.cta_body}</p>
      <a href="mailto:${C.brand.email}" style="display:inline-block;background:${pal.gold};color:${pal.deep};text-decoration:none;padding:12px 24px;font-size:14px;font-weight:700;font-family:Montserrat,sans-serif;">${C.finale.cta_button} →</a>
    </div>

    <p style="text-align:center;font-size:11px;color:${pal.grey};font-style:italic;margin-top:24px;font-family:Montserrat,sans-serif;">${C.brand.name} · ${C.brand.author} · ${C.brand.year} · Confidentiel</p>
  </div>
</div>
</body>
</html>`;
}
