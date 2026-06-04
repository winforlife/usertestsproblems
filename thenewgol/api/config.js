// Endpoint public — expose uniquement les clés client-side (jamais les secrets)
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.json({
    posthogKey:  process.env.POSTHOG_API_KEY  || '',
    posthogHost: process.env.POSTHOG_HOST     || 'https://eu.posthog.com',
    articleUrl:  process.env.URL_ARTICLE      || '/article',
  })
}
