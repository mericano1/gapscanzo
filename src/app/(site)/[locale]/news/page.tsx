import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeading } from '@/components/PageHeading';
import { Link } from '@/i18n/navigation';
import { fmtDate, getNews } from '@/lib/content';

export const revalidate = 3600;

export async function generateMetadata() {
  return { title: 'News' };
}

export default async function NewsIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const news = await getNews();
  const byYear = Map.groupBy(news, (n) => n.entry.date!.slice(0, 4));
  return (
    <>
      <PageHeading title={t('news')} />
      <div className="mx-auto max-w-3xl px-4 py-10">
        {[...byYear.entries()].map(([year, items]) => (
          <section key={year} className="mb-10">
            <h2 className="text-2xl font-extrabold text-roccia">{year}</h2>
            <ul className="mt-3 border-t border-roccia/15">
              {items.map(({ slug, entry }) => (
                <li key={slug} className="border-b border-roccia/15 py-4">
                  <p className="text-sm text-notte/70">{fmtDate(entry.date!, locale)}</p>
                  <Link href={`/news/${slug}`} className="font-display text-xl font-bold hover:underline">
                    {entry.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
