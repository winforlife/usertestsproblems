export const APP_CONFIG = {

  features: {
    posthog:  true,   // analytics + session recording
    calendly: true,   // module réservation call
  },

  urls: {
    questionnaire: '/questionnaire',   // CTA principal → funnel
    calendly:      'https://calendly.com/christophejouret',  // À remplacer avant déploiement
    site:          'https://thenewgol.com',
  },

}

export default APP_CONFIG
