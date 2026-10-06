import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { site } from '@/lib/site';
import { navGroups } from './nav';

export async function Footer() {
  const t = await getTranslations();
  const links = navGroups.flatMap((g) => g.children ?? [{ key: g.key, href: g.href! }]);
  return (
    <footer className="bg-notte text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-bold">{site.name}</p>
          <p className="mt-2 max-w-sm text-white/80">{t('footer.tagline')}</p>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-cielo">{t('footer.sede')}</h2>
          <address className="mt-2 not-italic text-white/80">
            {site.address}
            <br />
            <a className="underline underline-offset-4" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <br />
            <a className="underline underline-offset-4" href={site.facebook} rel="noopener">
              Facebook
            </a>
          </address>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-cielo">{t('footer.explore')}</h2>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 text-white/80">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block py-1 hover:text-white">
                  {t(`nav.${l.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t border-white/15 px-4 py-4 text-center text-sm text-white/60">
        © {new Date().getFullYear()} {t('footer.rights')}
      </p>
    </footer>
  );
}
