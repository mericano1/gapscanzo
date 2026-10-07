import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ItalianOnly } from '@/components/ItalianOnly';
import { Extras } from '@/components/Extras';
import { PageHeading } from '@/components/PageHeading';
import { heroImage } from '@/lib/heroes';
import { reader, renderMarkdoc } from '@/lib/content';

export async function generateStaticParams() {
  return (await reader.collections.pages.list()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: (await reader.collections.pages.read((await params).slug))?.title };
}

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const entry = await reader.collections.pages.read(slug);
  if (!entry) notFound();
  const en = locale === 'en' ? await reader.collections.pagesEn.read(slug) : null;
  const body = await renderMarkdoc((en ?? entry).content);
  return (
    <>
      <PageHeading title={(en ?? entry).title} image={heroImage(slug)} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {locale === 'en' && !en && <ItalianOnly />}
        <div className="prose prose-lg prose-gap">{body}</div>
        <Extras contacts={entry.contacts} gallery={entry.gallery} />
      </div>
    </>
  );
}
