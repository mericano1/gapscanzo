import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Photo } from '@/components/Photo';
import { Link } from '@/i18n/navigation';
import { fmtDate, reader, renderMarkdoc } from '@/lib/content';

export async function generateStaticParams() {
  return (await reader.collections.events.list()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: (await reader.collections.events.read((await params).slug))?.title };
}

export default async function EventPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const e = await reader.collections.events.read(slug);
  if (!e) notFound();
  const t = await getTranslations();
  const body = await renderMarkdoc(e.content);
  const when =
    e.endDate && e.endDate !== e.startDate
      ? `${fmtDate(e.startDate!, locale)} – ${fmtDate(e.endDate, locale)}`
      : fmtDate(e.startDate!, locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/calendario" className="text-sm font-bold text-roccia underline underline-offset-4">
        {t('common.backTo')} {t('nav.calendar')}
      </Link>
      <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">{e.title}</h1>
      <p className="mt-3 text-lg font-bold text-roccia">
        {when}
        {e.startTime ? ` · ${e.startTime}${e.endTime ? `–${e.endTime}` : ''}` : ''}
      </p>
      {e.categories.length > 0 && <p className="mt-1 text-notte/70">{e.categories.join(', ')}</p>}
      {(e.location || e.contact || e.cost) && (
        <dl className="mt-6 grid max-w-xl grid-cols-[7rem_1fr] gap-x-4 gap-y-2 rounded-lg bg-neve p-4">
          {e.location && (
            <>
              <dt className="font-bold">{t('common.where')}</dt>
              <dd>
                <a className="text-roccia underline underline-offset-4" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.location)}`}>
                  {e.location}
                </a>
              </dd>
            </>
          )}
          {e.contact && (
            <>
              <dt className="font-bold">{t('common.contact')}</dt>
              <dd>
                {e.contact}
                {e.contactPhone && <> · {e.contactPhone}</>}
                {e.contactEmail && (
                  <>
                    {' · '}
                    <a className="text-roccia underline underline-offset-4" href={`mailto:${e.contactEmail}`}>
                      {e.contactEmail}
                    </a>
                  </>
                )}
              </dd>
            </>
          )}
          {e.cost && (
            <>
              <dt className="font-bold">{t('common.cost')}</dt>
              <dd>{e.cost}</dd>
            </>
          )}
        </dl>
      )}
      {e.cover && <Photo src={e.cover} alt="" className="mt-6 w-full rounded-lg" />}
      <div className="prose prose-lg prose-gap mt-8">{body}</div>
    </article>
  );
}
