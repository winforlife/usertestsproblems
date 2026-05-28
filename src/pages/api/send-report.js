// api/send-report.js — Vercel Edge Function
import { Resend } from "resend";
import { generateReportHTML } from "./generate-pdf.js";
import CONFIG from "../config/rapport.config.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const SELECTIONS_LABELS = {
  1: "📄 Rapport détaillé personnalisé",
  2: "🎥 Tuto vidéo — Le chemin vers le plus haut potentiel",
  3: "🎙️ Visio collective 1h30 avec d'autres entrepreneurs",
  4: "🎯 Session offerte 45' — Débloquer un point urgent",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }
  try {
    const { nom, dob, email, selections, scores, profil } = await req.json();
    if (!nom || !email) {
      return new Response(JSON.stringify({ error: "Champs manquants" }), { status: 400 });
    }
    const profileLabel = CONFIG.profiles[profil]?.label || profil;
    const selectedItems = selections.length > 0
      ? selections.map(id => `<li style="margin:6px 0;font-family:Georgia;font-size:14px;">${SELECTIONS_LABELS[id]}</li>`).join("")
      : "<li>Aucune sélection</li>";

    // Rapport HTML personnalisé
    const reportHTML = generateReportHTML({ nom, dob, profil, scores });

    // Email utilisateur
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `The Game of Life - Votre Cartographie 🚀✨`,
      html: reportHTML,
    });

    // Email admin
    const scoresText = Object.entries(scores)
      .map(([id, s]) => `${id} ${CONFIG.dimensions[id]?.name}: ${s.toFixed(1)}/5`)
      .join("<br>");

    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `[GoL] Nouvelle soumission — ${nom} (${profileLabel})`,
      html: `<div style="font-family:Georgia,serif;max-width:500px;padding:20px;background:#FAFAF7;">
        <div style="background:#0D1A2B;color:#C4A46A;padding:12px 20px;border-radius:8px;margin-bottom:20px;font-size:12px;font-weight:700;text-transform:uppercase;">
          Nouvelle soumission — The Game of Life
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr><td style="padding:8px 0;color:#7A8A9A;width:150px;">Prénom</td><td style="padding:8px 0;font-weight:700;">${nom}</td></tr>
          <tr><td style="padding:8px 0;color:#7A8A9A;">Date de naissance</td><td style="padding:8px 0;">${dob || "Non renseigné"}</td></tr>
          <tr><td style="padding:8px 0;color:#7A8A9A;">Email</td><td style="padding:8px 0;">${email}</td></tr>
          <tr><td style="padding:8px 0;color:#7A8A9A;">Profil</td><td style="padding:8px 0;font-weight:700;color:#2E6090;">${profileLabel}</td></tr>
          <tr><td style="padding:8px 0;color:#7A8A9A;">Sélections</td><td style="padding:8px 0;"><ul style="margin:0;padding-left:16px;">${selectedItems}</ul></td></tr>
        </table>
        <div style="background:#F4F7FA;border-radius:8px;padding:12px;margin-top:16px;font-size:12px;line-height:1.8;">${scoresText}</div>
        <div style="margin-top:16px;">
          <a href="mailto:${email}" style="display:inline-block;background:#2E6090;color:white;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:700;">Répondre à ${nom} →</a>
        </div>
      </div>`,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("send-report error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500 });
  }
}

export const config = { runtime: "edge" };
