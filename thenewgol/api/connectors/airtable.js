import CONFIG from '../../config.js'

export async function createRecord(fields) {
  const url = `https://api.airtable.com/v0/${CONFIG.airtable.baseId}/${encodeURIComponent(CONFIG.airtable.tableName)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CONFIG.airtable.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Airtable ${res.status}: ${JSON.stringify(err)}`)
  }

  return res.json()
}
