import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeading } from '@/components/PageHeading';
import { reader } from '@/lib/content';
import { site } from '@/lib/site';

export async function generateMetadata() {
  return { title: 'Contatti' };
}

export default async function Contacts({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, n, page] = await Promise.all([getTranslations('contactsPage'), getTranslations('nav'), reader.collections.pages.read('contatti')]);
  const people = page?.contacts ?? [];
  const link = 'text-roccia underline underline-offset-4';
  return (
    <>
      <PageHeading title={n('contacts')} lead={t('intro')} />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2">
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-extrabold">{t('sede')}</h2>
            <p className="mt-2">{t('where')}</p>
            <p className="mt-1 font-bold">{t('hours')}</p>
          </section>
          <section>
            <h2 className="text-2xl font-extrabold">{t('people')}</h2>
            <ul className="mt-2 space-y-1">
              {people.map((p) => (
                <li key={p.email}>
                  <a className={link} href={`mailto:${p.email}`}>
                    {p.name.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())}
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-extrabold">{t('writeUs')}</h2>
            <p className="mt-2">
              <a className={link} href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </p>
            <p className="mt-1">
              <a className={link} href={site.facebook} rel="noopener">
                {t('follow')}
              </a>
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-extrabold">{t('links')}</h2>
            <ul className="mt-2 space-y-1">
              <li>
                <a className={link} href="http://www.comune.scanzorosciate.bg.it/" rel="noopener">
                  {t('comune')}
                </a>
              </li>
              <li>
                <a className={link} href="http://www.ilmeteo.it/meteo/Scanzorosciate" rel="noopener">
                  {t('weather')}
                </a>
              </li>
            </ul>
          </section>
        </div>
        {page?.mapLink && (
          <iframe title={t('map')} src={page.mapLink} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aspect-square w-full rounded-lg border-0 lg:aspect-auto lg:min-h-[28rem]" />
        )}
      </div>
    </>
  );
}
