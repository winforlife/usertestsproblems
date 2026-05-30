import { createRecord, updateRecord } from './connectors/airtable.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { recordId, question, value, utm_source, utm_content } = req.body ?? {}

  if (!question || value === undefined) {
    return res.status(400).json({ error: 'question et value requis' })
  }

  const fields = { [question.toUpperCase()]: Number(value) || 0 }

  try {
    if (recordId) {
      await updateRecord(recordId, fields)
      return res.status(200).json({ ok: true, recordId })
    } else {
      if (utm_source)  fields.UTM_source  = utm_source
      if (utm_content) fields.UTM_content = utm_content
      const rec = await createRecord(fields)
      return res.status(200).json({ ok: true, recordId: rec.id })
    }
  } catch (err) {
    console.error('[save-answer]', err)
    return res.status(500).json({ error: 'save failed' })
  }
}
