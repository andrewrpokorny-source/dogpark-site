// schema.org data for Google (home page): who we are, so searches for the brand can show
// the right name, logo and contact details. Add Product data for the game once it has a
// price and can actually be bought; Google shouldn't show prices for preview-only items.
const SITE = 'https://www.dogparkgames.com';

export const siteJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    name: 'Dog Park Games',
    alternateName: 'Dog Park: A Get Lost! Game',
    url: `${SITE}/`,
    publisher: { '@id': `${SITE}/#organization` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE}/#organization`,
    name: 'Dog Park Games',
    legalName: 'Get Lost Mazes LLC',
    url: `${SITE}/`,
    logo: `${SITE}/email/logo-registered.png`,
    email: 'help@dogparkgames.com',
    description:
      'Makers of Dog Park: A Get Lost! Game, a family-friendly labyrinth board game created by Brenda Pokorny.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Institute Street',
      postOfficeBoxNumber: '901',
      addressLocality: 'Mooresville',
      addressRegion: 'NC',
      postalCode: '28115',
      addressCountry: 'US',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'help@dogparkgames.com',
    },
    founder: {
      '@type': 'Person',
      name: 'Brenda Pokorny',
      url: 'https://www.brendapokornymosaics.com/',
    },
  },
];
