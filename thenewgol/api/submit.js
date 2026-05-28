import { Resend }  from 'resend'
import { PostHog } from 'posthog-node'
import CONFIG      from '../config.js'
import { createRecord } from './connectors/airtable.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prenom, age, email, utm_source, utm_content, ...rest } = req.body ?? {}

  // Validation
  if (!prenom || !age || !email) {
    return res.status(400).json({ error: 'Champs requis manquants' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Format email invalide' })
  }

  // Extraire q1..q10
  const qs = {}
  for (let i = 1; i <= 10; i++) qs[`q${i}`] = Number(rest[`q${i}`]) || 0

  // Score moyen côté serveur
  const vals = Object.values(qs).filter(v => v >= 1 && v <= 5)
  const scoreMoyen = vals.length
    ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
    : 0

  const resend = new Resend(CONFIG.resend.apiKey)
  const ph     = new PostHog(CONFIG.posthog.apiKey, { host: CONFIG.posthog.host })

  const results = await Promise.allSettled([

    // 1. Airtable
    createRecord({
      Prenom:      prenom,
      Age:         age,
      Email:       email,
      Q1:          qs.q1,  Q2:  qs.q2,  Q3:  qs.q3,
      Q4:          qs.q4,  Q5:  qs.q5,  Q6:  qs.q6,
      Q7:          qs.q7,  Q8:  qs.q8,  Q9:  qs.q9,
      Q10:         qs.q10,
      UTM_source:  utm_source  || '',
      UTM_content: utm_content || '',
    }),

    // 2. Email Christophe
    resend.emails.send({
      from:    CONFIG.resend.from,
      to:      CONFIG.resend.toChristophe,
      subject: `Nouvelle réponse — ${prenom} · ${age} · ${utm_source || 'direct'}`,
      html:    buildEmailChristophe({ prenom, age, email, qs, utm_source, utm_content, scoreMoyen }),
    }),

    // 3. Email prospect
    resend.emails.send({
      from:    CONFIG.resend.from,
      to:      email,
      subject: "Ce que j'ai découvert après avoir vendu ma société",
      html:    buildEmailProspect({ prenom, articleUrl: CONFIG.urls.article }),
    }),

  ])

  // PostHog server-side — identifie le répondant par email
  ph.capture({
    distinctId: email,
    event:      'submission_saved',
    properties: {
      prenom,
      age,
      score_moyen: scoreMoyen,
      utm_source:  utm_source  || '',
      utm_content: utm_content || '',
      q1: qs.q1, q2: qs.q2, q3: qs.q3, q4: qs.q4,  q5: qs.q5,
      q6: qs.q6, q7: qs.q7, q8: qs.q8, q9: qs.q9, q10: qs.q10,
    },
  })
  await ph.shutdown()

  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`[submit] action ${i} failed:`, r.reason)
  })

  return res.status(200).json({ ok: true })
}

// ── Templates email ────────────────────────────────────────────────────────────

function buildEmailChristophe({ prenom, age, email, qs, utm_source, utm_content, scoreMoyen }) {
  const rows = Object.entries(qs)
    .map(([k, v]) => `<tr>
      <td style="padding:8px 16px;border-bottom:1px solid #e8e0d0;font-weight:700;color:#0D1B2E;font-size:13px">${k.toUpperCase()}</td>
      <td style="padding:8px 16px;border-bottom:1px solid #e8e0d0;color:#333;font-size:13px">${v} / 5</td>
    </tr>`)
    .join('')

  return `<!DOCTYPE html><html lang="fr"><body style="font-family:Georgia,serif;background:#f5f5f0;margin:0;padding:20px">
    <div style="max-width:580px;margin:0 auto;background:#fff;border-top:3px solid #C8973A">
      <div style="background:#0D1B2E;padding:20px 28px">
        <p style="color:#C8973A;font-size:11px;font-family:Arial,sans-serif;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0">TheNewGOL.com — Nouvelle réponse</p>
      </div>
      <div style="padding:28px">
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr><td style="padding:8px 16px;border-bottom:1px solid #e8e0d0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Prénom</td><td style="padding:8px 16px;border-bottom:1px solid #e8e0d0;font-weight:700;color:#0D1B2E">${prenom}</td></tr>
          <tr><td style="padding:8px 16px;border-bottom:1px solid #e8e0d0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Âge</td><td style="padding:8px 16px;border-bottom:1px solid #e8e0d0;font-weight:700;color:#0D1B2E">${age}</td></tr>
          <tr><td style="padding:8px 16px;border-bottom:1px solid #e8e0d0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Email</td><td style="padding:8px 16px;border-bottom:1px solid #e8e0d0;color:#0D1B2E">${email}</td></tr>
          <tr><td style="padding:8px 16px;border-bottom:1px solid #e8e0d0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Score moyen</td><td style="padding:8px 16px;border-bottom:1px solid #e8e0d0;font-weight:700;color:#C8973A;font-size:16px">${scoreMoyen} / 5</td></tr>
          <tr><td style="padding:8px 16px;border-bottom:1px solid #e8e0d0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">UTM source</td><td style="padding:8px 16px;border-bottom:1px solid #e8e0d0;color:#0D1B2E">${utm_source || '—'}</td></tr>
          <tr><td style="padding:8px 16px;border-bottom:1px solid #e8e0d0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">UTM content</td><td style="padding:8px 16px;border-bottom:1px solid #e8e0d0;color:#0D1B2E">${utm_content || '—'}</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
      </div>
    </div>
  </body></html>`
}

function buildEmailProspect({ prenom, articleUrl }) {
  return `<!DOCTYPE html><html lang="fr"><body style="font-family:Georgia,serif;background:#f5f5f0;margin:0;padding:20px">
    <div style="max-width:580px;margin:0 auto;background:#fff;border-top:3px solid #C8973A">
      <div style="background:#0D1B2E;padding:20px 28px">
        <p style="color:#C8973A;font-size:11px;font-family:Arial,sans-serif;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0">The New Game of Life · TheNewGOL.com</p>
      </div>
      <div style="padding:36px 28px">
        <p style="color:#0D1B2E;font-size:17px;margin:0 0 20px">Bonjour ${prenom},</p>
        <p style="color:#333;font-size:14px;line-height:1.8;margin:0 0 16px">Merci d'avoir pris le temps de répondre à ces dix questions.</p>
        <p style="color:#333;font-size:14px;line-height:1.8;margin:0 0 28px">Comme promis, voici l'article :</p>
        <div style="text-align:center;margin:0 0 32px">
          <a href="${articleUrl}" style="background:#C8973A;color:#fff;text-decoration:none;padding:15px 36px;font-family:Arial,sans-serif;font-weight:700;font-size:13px;letter-spacing:0.06em;display:inline-block">→ Lire l'article</a>
        </div>
        <p style="color:#555;font-size:14px;line-height:1.85;font-style:italic;margin:0 0 16px">Ce que j'y partage n'est pas une méthode. Ce n'est pas un framework de plus. C'est une conversation honnête sur ce que j'ai vu — après avoir tout essayé, tout optimisé, et réalisé qu'il manquait quelque chose d'essentiel.</p>
        <p style="color:#333;font-size:14px;line-height:1.8;margin:0 0 16px">Si quelque chose dans cet article résonne — pas comme une information, mais comme une reconnaissance — je suis disponible pour en parler.</p>
        <p style="color:#333;font-size:14px;line-height:1.8;margin:0 0 32px">Réponds directement à cet email.</p>
        <p style="color:#0D1B2E;font-size:14px;margin:0"><strong>Christophe Jouret</strong></p>
        <p style="color:#888;font-size:12px;margin:4px 0 0">The New Game of Life · TheNewGOL.com</p>
      </div>
    </div>
  </body></html>`
}
