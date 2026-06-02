import { Resend }  from 'resend'
import { PostHog } from 'posthog-node'
import CONFIG      from '../config.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prenom, email, q1, q2, q3, q4, q5, utm_source, utm_content } = req.body ?? {}

  if (!prenom || !email) {
    return res.status(400).json({ error: 'Champs requis manquants' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Format email invalide' })
  }

  const resend = new Resend(CONFIG.resend.apiKey)
  const ph     = new PostHog(CONFIG.posthog.apiKey, { host: CONFIG.posthog.host })

  const results = await Promise.allSettled([

    // Email 1 · Christophe
    resend.emails.send({
      from:    CONFIG.resend.from,
      to:      CONFIG.resend.toChristophe,
      subject: `Nouvelle réponse questionnaire — ${prenom}`,
      html:    buildEmailChristophe({ prenom, email, q1, q2, q3, q4, q5, utm_source, utm_content }),
    }),

    // Email 2 · Prospect
    resend.emails.send({
      from:    CONFIG.resend.from,
      to:      email,
      subject: "Ce que j'ai appris à voir — et que personne ne m'avait montré",
      html:    buildEmailProspect({
        prenom,
        articleUrl: `${CONFIG.urls.article}?utm_source=email&utm_content=welcome`,
      }),
    }),

  ])

  ph.capture({
    distinctId: email,
    event:      'submission_saved',
    properties: {
      prenom,
      utm_source:  utm_source  || '',
      utm_content: utm_content || '',
      has_q5:      !!(q5 && q5.trim()),
    },
  })
  await ph.shutdown()

  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`[submit] email ${i + 1} failed:`, r.reason)
  })

  return res.status(200).json({ ok: true })
}

// ── Email templates ──────────────────────────────────────────────────────────

const Q_LABELS = {
  q1: "Dans ton business en ce moment, qu'est-ce qui résiste le plus malgré tes efforts ?",
  q2: "Quand quelque chose ne fonctionne pas comme prévu, vers quoi te tournes-tu en premier ?",
  q3: "Est-ce qu'il t'arrive de prendre des décisions que tu sais ne pas être les meilleures — mais que tu prends quand même ?",
  q4: "Si tu pouvais voir ton business depuis une altitude différente, qu'est-ce que tu regarderais en premier ?",
  q5: "Y a-t-il quelque chose dans ton business que tu regardes depuis longtemps sans vraiment voir ce qui le crée ?",
}

function buildEmailChristophe({ prenom, email, q1, q2, q3, q4, q5, utm_source, utm_content }) {
  const qRows = [
    { label: Q_LABELS.q1, value: q1 },
    { label: Q_LABELS.q2, value: q2 },
    { label: Q_LABELS.q3, value: q3 },
    { label: Q_LABELS.q4, value: q4 },
    ...(q5 ? [{ label: Q_LABELS.q5, value: q5 }] : []),
  ]
    .map(({ label, value }) => `
      <tr>
        <td style="padding:10px 16px 4px;font-size:11px;color:#888;letter-spacing:0.08em;text-transform:uppercase;border-top:1px solid #eee">
          ${label}
        </td>
      </tr>
      <tr>
        <td style="padding:4px 16px 14px;font-size:14px;color:#0D1B2E;line-height:1.6">
          <strong>${value || '—'}</strong>
        </td>
      </tr>`)
    .join('')

  return `<!DOCTYPE html><html lang="fr">
<body style="font-family:Georgia,serif;background:#f5f5f0;margin:0;padding:20px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-top:3px solid #C8973A">
    <div style="background:#0D1B2E;padding:20px 28px">
      <p style="color:#C8973A;font-size:11px;font-family:Arial,sans-serif;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0">
        TheNewGOL.com — Nouvelle réponse questionnaire
      </p>
    </div>
    <div style="padding:28px">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr>
          <td style="padding:8px 16px;border-bottom:1px solid #eee;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em">Prénom</td>
          <td style="padding:8px 16px;border-bottom:1px solid #eee;font-weight:700;color:#0D1B2E">${prenom}</td>
        </tr>
        <tr>
          <td style="padding:8px 16px;border-bottom:1px solid #eee;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em">Email</td>
          <td style="padding:8px 16px;border-bottom:1px solid #eee;color:#0D1B2E">${email}</td>
        </tr>
        <tr>
          <td style="padding:8px 16px;border-bottom:1px solid #eee;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em">UTM source</td>
          <td style="padding:8px 16px;border-bottom:1px solid #eee;color:#0D1B2E">${utm_source || '—'}</td>
        </tr>
        <tr>
          <td style="padding:8px 16px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em">UTM content</td>
          <td style="padding:8px 16px;color:#0D1B2E">${utm_content || '—'}</td>
        </tr>
      </table>
      <table style="width:100%;border-collapse:collapse">${qRows}</table>
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #eee;text-align:center">
        <a href="mailto:${email}" style="background:#C8973A;color:#fff;text-decoration:none;padding:12px 28px;font-family:Arial,sans-serif;font-weight:700;font-size:12px;letter-spacing:0.06em;display:inline-block">
          → Répondre à ${prenom}
        </a>
      </div>
    </div>
  </div>
</body></html>`
}

function buildEmailProspect({ prenom, articleUrl }) {
  return `<!DOCTYPE html><html lang="fr">
<body style="font-family:Georgia,serif;background:#f5f5f0;margin:0;padding:20px">
  <div style="max-width:580px;margin:0 auto;background:#fff;border-top:3px solid #C8973A">
    <div style="background:#0D1B2E;padding:20px 28px">
      <p style="color:#C8973A;font-size:11px;font-family:Arial,sans-serif;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0">
        The New Game of Life · TheNewGOL.com
      </p>
    </div>
    <div style="padding:36px 28px">
      <p style="color:#0D1B2E;font-size:17px;margin:0 0 20px">Bonjour ${prenom},</p>
      <p style="color:#333;font-size:14px;line-height:1.8;margin:0 0 16px">
        Merci d'avoir pris le temps de répondre à ces questions.
      </p>
      <p style="color:#555;font-size:14px;line-height:1.85;font-style:italic;margin:0 0 28px">
        Ce que je partage dans cet article n'est pas une méthode. Ce n'est pas un framework de plus.
        C'est une conversation honnête sur ce que j'ai vu — après avoir tout essayé,
        tout optimisé, et réalisé qu'il manquait quelque chose d'essentiel.
      </p>
      <div style="text-align:center;margin:0 0 32px">
        <a href="${articleUrl}"
           style="background:#C8973A;color:#fff;text-decoration:none;padding:15px 36px;font-family:Arial,sans-serif;font-weight:700;font-size:13px;letter-spacing:0.06em;display:inline-block">
          → Lire l'article
        </a>
      </div>
      <p style="color:#333;font-size:14px;line-height:1.8;margin:0 0 16px">
        Si quelque chose résonne — pas comme une information, mais comme une reconnaissance —
        je suis disponible pour en parler. Réponds directement à cet email.
      </p>
      <p style="color:#0D1B2E;font-size:14px;margin:0"><strong>Christophe Jouret</strong></p>
      <p style="color:#888;font-size:12px;margin:4px 0 0">The New Game of Life · TheNewGOL.com</p>
    </div>
  </div>
</body></html>`
}
