// api/saveanswer.js — Vercel Edge Function
// Enregistre une réponse par question dans Airtable (fire-and-forget côté client).
// Premier appel : crée le record et renvoie recordId.
// Appels suivants : met à jour le record existant.

import { createRecord, updateRecord } from "./connectors/airtable.js";

const TABLE = "GOL_Questionnaire";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }
  try {
    const { sessionId, recordId, questionId, value } = await req.json();
    if (!sessionId || questionId === undefined || value === undefined) {
      return new Response(JSON.stringify({ error: "Champs manquants" }), { status: 400 });
    }

    let id = recordId;

    if (!recordId) {
      const result = await createRecord(TABLE, {
        Session_ID: sessionId,
        [`Q${questionId}`]: value,
        Timestamp: new Date().toISOString(),
      });
      id = result.id;
    } else {
      await updateRecord(TABLE, recordId, {
        [`Q${questionId}`]: value,
      });
    }

    return new Response(JSON.stringify({ ok: true, recordId: id }), { status: 200 });
  } catch (err) {
    console.error("saveanswer error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500 });
  }
}

export const config = { runtime: "edge" };
