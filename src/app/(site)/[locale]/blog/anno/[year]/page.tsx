import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeading } from '@/components/PageHeading';
import { PostList } from '@/components/PostList';
import { YearNav } from '@/components/YearNav';
import { getBlogByYear } from '@/lib/content';

export async function generateStaticParams() {
  return (await getBlogByYear()).map(([year]) => ({ year }));
}

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }) {
  return { title: `Blog ${(await params).year}` };
}

export default async function BlogYear({ params }: { params: Promise<{ locale: string; year: string }> }) {
  const { locale, year } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const years = await getBlogByYear();
  const posts = years.find(([y]) => y === year)?.[1];
  if (!posts) notFound();
  return (
    <>
      <PageHeading title={`${t('blog')} ${year}`} />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <YearNav years={years.map(([y, items]) => [y, items.length])} current={year} />
        <div className="mt-8">
          <PostList posts={posts} locale={locale} />
        </div>
      </div>
    </>
  );
}
