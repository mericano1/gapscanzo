import { setRequestLocale, getTranslations } from 'next-intl/server';
import { EventRow } from '@/components/EventRow';
import { PageHeading } from '@/components/PageHeading';
import { heroImage } from '@/lib/heroes';
import { getEvents } from '@/lib/content';

export const revalidate = 3600;

export async function generateMetadata() {
  return { title: 'Calendario' };
}

export default async function Calendar({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const today = new Date().toISOString().slice(0, 10);
  const all = await getEvents();
  const upcoming = all.filter((e) => (e.entry.endDate || e.entry.startDate!) >= today);
  const past = all.filter((e) => (e.entry.endDate || e.entry.startDate!) < today).reverse();
  const byYear = Map.groupBy(past, (e) => e.entry.startDate!.slice(0, 4));
  const row = ({ slug, entry }: (typeof all)[number]) => (
    <EventRow key={slug} slug={slug} locale={locale} title={entry.title} startDate={entry.startDate!} endDate={entry.endDate} startTime={entry.startTime} categories={entry.categories} />
  );
  return (
    <>
      <PageHeading title={t('nav.calendar')} image={heroImage('calendario')} />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h2 className="text-2xl font-extrabold">{t('common.upcoming')}</h2>
        {upcoming.length ? <ul className="mt-3 border-t border-roccia/15">{upcoming.map(row)}</ul> : <p className="mt-3 text-notte/70">{t('home.noUpcoming')}</p>}
        <h2 className="mt-14 text-2xl font-extrabold">{t('common.past')}</h2>
        {[...byYear.entries()].map(([year, items], i) => (
          <details key={year} className="mt-3 border-b border-roccia/15" open={i === 0}>
            <summary className="cursor-pointer py-3 font-display text-xl font-bold text-roccia">
              {year} <span className="text-sm font-normal text-notte/60">({items.length})</span>
            </summary>
            <ul>{items.map(row)}</ul>
          </details>
        ))}
      </div>
    </>
  );
}
