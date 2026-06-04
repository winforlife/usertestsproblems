export const CONFIG = {

  // Resend — email transactionnel
  resend: {
    apiKey:       process.env.RESEND_API_KEY,
    from:         process.env.EMAIL_FROM,
    toChristophe: process.env.EMAIL_CHRISTOPHE,
  },

  // Airtable — stockage des réponses (Phase 1)
  airtable: {
    apiKey:    process.env.AIRTABLE_API_KEY,
    baseId:    process.env.AIRTABLE_BASE_ID,
    tableName: process.env.AIRTABLE_TABLE_NAME, // "Reponses"
  },

  // PostHog — analytics
  posthog: {
    apiKey: process.env.POSTHOG_API_KEY,
    host:   process.env.POSTHOG_HOST || 'https://eu.posthog.com',
  },

  // URLs
  urls: {
    article: process.env.URL_ARTICLE, // https://thenewgol.com/article
    site:    'https://thenewgol.com',
  },

  // Supabase — Phase 2 (désactivé en Phase 1)
  // supabase: {
  //   url:     process.env.SUPABASE_URL,
  //   anonKey: process.env.SUPABASE_ANON_KEY,
  // },
}

export default CONFIG
