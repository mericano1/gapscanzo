import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import redirectMap from './data/redirects.json';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// The photo archive lives in object storage, not git. Files in public/ (media/site) win;
// anything else under /media is proxied to MEDIA_BASE (e.g. https://<store>.public.blob.vercel-storage.com).
const mediaBase = process.env.MEDIA_BASE?.replace(/\/$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    return mediaBase ? [{ source: '/media/:path*', destination: `${mediaBase}/media/:path*` }] : [];
  },
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
