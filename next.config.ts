import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import redirectMap from './data/redirects.json';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The old site was also served from a /new staging prefix.
      { source: '/new', destination: '/', permanent: true },
      { source: '/new/:path*', destination: '/:path*', permanent: true },
      // Old WordPress permalinks (blog posts by date, calendar events).
      ...redirectMap.map(({ from, to }) => ({ source: from.replace(/\/$/, ''), destination: to, permanent: true })),
    ];
  },
};

export default withNextIntl(nextConfig);
