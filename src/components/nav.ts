export type NavGroup = { key: string; href?: string; children?: { key: string; href: string }[] };

export const navGroups: NavGroup[] = [
  {
    key: 'about',
    children: [
      { key: 'history', href: '/la-storia' },
      { key: 'board', href: '/il-consiglio' },
      { key: 'statute', href: '/lo-statuto' },
      { key: 'nodo', href: '/il-nodo' },
      { key: 'join', href: '/unisciti-a-noi' },
    ],
  },
  { key: 'activities', href: '/attivita' },
  { key: 'calendar', href: '/calendario' },
  { key: 'news', href: '/news' },
  { key: 'blog', href: '/blog' },
  { key: 'contacts', href: '/contatti' },
];
