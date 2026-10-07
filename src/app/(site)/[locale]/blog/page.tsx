import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeading } from '@/components/PageHeading';
import { heroImage } from '@/lib/heroes';
import { PostList } from '@/components/PostList';
import { YearNav } from '@/components/YearNav';
import { getBlog, getBlogByYear } from '@/lib/content';

export async function generateMetadata() {
  return { title: 'Blog' };
}

export default async function BlogIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const [latest, years] = await Promise.all([getBlog().then((p) => p.slice(0, 20)), getBlogByYear()]);
  return (
    <>
      <PageHeading title={t('blog')} image={heroImage('blog')} />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <YearNav years={years.map(([y, items]) => [y, items.length])} />
        <div className="mt-8">
          <PostList posts={latest} locale={locale} />
        </div>
      </div>
    </>
  );
}
