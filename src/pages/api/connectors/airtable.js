// Airtable REST connector — Edge-compatible (fetch only, no Node deps)

const baseUrl = (tableName) =>
  `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;

const headers = () => ({
  Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
  "Content-Type": "application/json",
});

async function checkResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Airtable ${res.status}: ${JSON.stringify(err)}`);
  }
  return res.json();
}

export async function createRecord(tableName, fields) {
  const res = await fetch(baseUrl(tableName), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ fields }),
  });
  return checkResponse(res);
}

export async function updateRecord(tableName, id, fields) {
  const res = await fetch(`${baseUrl(tableName)}/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ fields }),
  });
  return checkResponse(res);
}
