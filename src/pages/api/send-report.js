// api/send-report.js — Vercel Edge Function
import { Resend } from "resend";
import { generateReportHTML } from "./generate-pdf.js";
import CONFIG from "../config/rapport.config.js";
import { updateRecord } from "./connectors/airtable.js";

const resend = new Resend(process.env.RESEND_API_KEY);
const pal = CONFIG.palette;

const SELECTIONS_LABELS = {
  1: "Rapport détaillé personnalisé",
  2: "Tuto vidéo — Le chemin vers le plus haut potentiel",
  3: "Visio collective 1h30 avec d'autres entrepreneurs",
  4: "Session offerte 45 min — Débloquer un point urgent",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }
  try {
    const { nom, dob, email, genre, selections, scores, profil, sessionId, recordId } = await req.json();
    if (!nom || !email) {
      return new Response(JSON.stringify({ error: "Champs manquants" }), { status: 400 });
    }
    const profileLabel = CONFIG.profiles[profil]?.label || profil;
    const selectedItems = (selections || []).length > 0
      ? (selections || []).map(id => `<li style="margin:6px 0;font-family:Montserrat,sans-serif;font-size:14px;color:${pal.cream};">${SELECTIONS_LABELS[id]}</li>`).join("")
      : `<li style="color:${pal.grey};">Aucune sélection</li>`;

    // Rapport HTML personnalisé
    const reportHTML = generateReportHTML({ nom, dob, profil, scores });

    // Email utilisateur
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `The New Game of Life — Votre Cartographie personnalisée`,
      html: reportHTML,
    });

    // Email admin
    const scoresText = Object.entries(scores)
      .map(([id, s]) => `${id} ${CONFIG.dimensions[id]?.name}: ${s.toFixed(1)}/5`)
      .join("<br>");

    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `[TNGOL] Nouvelle soumission — ${nom} (${profileLabel})`,
      html: `<div style="font-family:Montserrat,sans-serif;max-width:500px;padding:20px;background:${pal.deep};">
        <div style="background:${pal.navy};color:${pal.gold};padding:12px 20px;margin-bottom:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;border-bottom:2px solid ${pal.gold};">
          Nouvelle soumission — The New Game of Life
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr><td style="padding:8px 0;color:${pal.grey};width:150px;">Prénom</td><td style="padding:8px 0;font-weight:700;color:${pal.cream};">${nom}</td></tr>
          <tr><td style="padding:8px 0;color:${pal.grey};">Date de naissance</td><td style="padding:8px 0;color:${pal.cream};">${dob || "Non renseigné"}</td></tr>
          <tr><td style="padding:8px 0;color:${pal.grey};">Email</td><td style="padding:8px 0;color:${pal.cream};">${email}</td></tr>
          <tr><td style="padding:8px 0;color:${pal.grey};">Genre</td><td style="padding:8px 0;color:${pal.cream};">${genre || "Non renseigné"}</td></tr>
          <tr><td style="padding:8px 0;color:${pal.grey};">Profil</td><td style="padding:8px 0;font-weight:700;color:${pal.gold};">${profileLabel}</td></tr>
          <tr><td style="padding:8px 0;color:${pal.grey};">Sélections</td><td style="padding:8px 0;"><ul style="margin:0;padding-left:16px;">${selectedItems}</ul></td></tr>
        </table>
        <div style="background:${pal.navy};padding:12px;margin-top:16px;font-size:12px;line-height:1.8;color:${pal.cream};border-left:3px solid ${pal.gold};">${scoresText}</div>
        <div style="margin-top:16px;">
          <a href="mailto:${email}" style="display:inline-block;background:${pal.gold};color:${pal.deep};text-decoration:none;padding:10px 20px;font-size:13px;font-weight:700;">Répondre à ${nom} →</a>
        </div>
      </div>`,
    });

    // Mise à jour Airtable avec profil + email (fire-and-forget)
    if (recordId && process.env.AIRTABLE_API_KEY) {
      updateRecord("GOL_Questionnaire", recordId, {
        Prenom: nom,
        DOB: dob || "",
        Email: email,
        Genre: genre || "n",
        Profil: profil,
        D1: scores.D1, D2: scores.D2, D3: scores.D3,
        D4: scores.D4, D5: scores.D5, D6: scores.D6,
        Soumis: new Date().toISOString(),
      }).catch(() => {});
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("send-report error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500 });
  }
}

export const config = { runtime: "edge" };
