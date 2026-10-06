import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Photo } from '@/components/Photo';
import { Link } from '@/i18n/navigation';
import { fmtDate, reader, renderMarkdoc } from '@/lib/content';

export async function generateStaticParams() {
  return (await reader.collections.news.list()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const entry = await reader.collections.news.read((await params).slug);
  return { title: entry?.title, description: entry?.summary || undefined };
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const entry = await reader.collections.news.read(slug);
  if (!entry) notFound();
  const t = await getTranslations();
  const body = await renderMarkdoc(entry.content);
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/news" className="text-sm font-bold text-roccia underline underline-offset-4">
        {t('common.backTo')} {t('nav.news')}
      </Link>
      <p className="mt-6 text-sm text-notte/70">{fmtDate(entry.date!, locale)}</p>
      <h1 className="mt-1 text-4xl font-extrabold sm:text-5xl">{entry.title}</h1>
      {entry.cover && <Photo src={entry.cover} alt="" className="mt-6 w-full rounded-lg" />}
      <div className="prose prose-lg prose-gap mt-8">{body}</div>
    </article>
  );
}
