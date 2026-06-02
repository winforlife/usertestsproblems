export default function handler(req, res) {
  return res.status(200).json({
    posthogKey:  process.env.POSTHOG_API_KEY  || '',
    posthogHost: process.env.POSTHOG_HOST     || 'https://eu.posthog.com',
  })
}
