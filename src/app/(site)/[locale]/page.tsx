import { setRequestLocale, getTranslations } from 'next-intl/server';
import { EventRow } from '@/components/EventRow';
import { Photo } from '@/components/Photo';
import { Ridge } from '@/components/Ridge';
import { Link } from '@/i18n/navigation';
import { activityTiles, fmtDate, getFeaturedNews, getUpcomingEvents } from '@/lib/content';

export const revalidate = 3600;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const lang = locale === 'en' ? 'en' : 'it';
  const [upcoming, featured] = await Promise.all([getUpcomingEvents(4), getFeaturedNews(3)]);

  return (
    <>
      <section className="bg-cielo text-notte">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pb-24 sm:pt-20">
          <h1 className="max-w-4xl text-balance text-5xl font-extrabold sm:text-7xl lg:text-8xl">{t('title')}</h1>
          <p className="mt-6 max-w-xl text-lg sm:text-xl">{t('lead')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/unisciti-a-noi" className="rounded-md bg-larice px-6 py-3 font-bold text-notte hover:bg-larice-700 hover:text-white">
              {t('ctaJoin')}
            </Link>
            <Link href="/calendario" className="rounded-md border-2 border-notte px-6 py-3 font-bold hover:bg-notte hover:text-white">
              {t('ctaCalendar')}
            </Link>
          </div>
        </div>
        <Ridge className="-mb-px block h-32 w-full text-white sm:h-56 lg:h-72" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <h2 className="text-3xl font-extrabold sm:text-4xl">{t('upcoming')}</h2>
          <Link href="/calendario" className="font-bold text-roccia underline underline-offset-4">
            {t('allEvents')}
          </Link>
        </div>
        {upcoming.length ? (
          <ul className="mt-6 max-w-3xl border-t border-roccia/15">
            {upcoming.map(({ slug, entry }) => (
              <EventRow key={slug} slug={slug} locale={locale} title={entry.title} startDate={entry.startDate!} endDate={entry.endDate} startTime={entry.startTime} categories={entry.categories} />
            ))}
          </ul>
        ) : (
          <p className="mt-6 max-w-xl text-notte/70">{t('noUpcoming')}</p>
        )}
      </section>

      <section className="bg-neve py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-extrabold sm:text-4xl">{t('activities')}</h2>
          <ul className="mt-8 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] md:grid-cols-4">
            {activityTiles.map((a, i) => (
              <li key={a.slug} className={i === 0 ? 'col-span-2 row-span-2' : i >= 5 ? 'md:col-span-2' : ''}>
                <Link href={a.href} className="group relative block h-full overflow-hidden rounded-lg bg-roccia">
                  <Photo src={`/media/site/${a.image}.webp`} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-notte/85 to-transparent p-4 pt-10 font-display text-xl font-bold text-white sm:text-2xl">{a.label[lang]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <h2 className="text-3xl font-extrabold sm:text-4xl">{t('featured')}</h2>
          <Link href="/news" className="font-bold text-roccia underline underline-offset-4">
            {t('allNews')}
          </Link>
        </div>
        <ul className="mt-8 grid gap-8 md:grid-cols-3">
          {featured.map(({ slug, entry }) => (
            <li key={slug}>
              <Link href={`/news/${slug}`} className="group block">
                {entry.cover ? (
                  <Photo src={entry.cover} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
                ) : (
                  <div className="aspect-[4/3] rounded-lg bg-cielo" aria-hidden="true" />
                )}
                <p className="mt-3 text-sm text-notte/70">{fmtDate(entry.date!, locale)}</p>
                <h3 className="mt-1 text-xl font-bold group-hover:underline">{entry.title}</h3>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-roccia text-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="max-w-xl font-display text-2xl font-bold sm:text-3xl">“{t('quote')}”</p>
            <p className="mt-2 text-white/80">{t('quoteAuthor')}</p>
          </div>
          <div className="max-w-sm">
            <h2 className="text-xl font-bold">{t('joinTitle')}</h2>
            <p className="mt-2 text-white/85">{t('joinText')}</p>
            <Link href="/unisciti-a-noi" className="mt-4 inline-block rounded-md bg-larice px-6 py-3 font-bold text-notte hover:bg-white">
              {t('ctaJoin')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
