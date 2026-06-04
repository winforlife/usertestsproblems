import CONFIG from '../../config.js'

const baseUrl = () =>
  `https://api.airtable.com/v0/${CONFIG.airtable.baseId}/${encodeURIComponent(CONFIG.airtable.tableName)}`

const headers = () => ({
  Authorization: `Bearer ${CONFIG.airtable.apiKey}`,
  'Content-Type': 'application/json',
})

async function checkResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Airtable ${res.status}: ${JSON.stringify(err)}`)
  }
  return res.json()
}

export async function createRecord(fields) {
  const res = await fetch(baseUrl(), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ fields }),
  })
  return checkResponse(res)
}

export async function updateRecord(id, fields) {
  const res = await fetch(`${baseUrl()}/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ fields }),
  })
  return checkResponse(res)
}
