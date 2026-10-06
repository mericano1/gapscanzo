import { Link } from '@/i18n/navigation';
import { fmtDate } from '@/lib/content';
import { Photo } from './Photo';

type Post = { slug: string; entry: { title: string; date: string | null; summary: string; cover: string | null; tags: readonly string[] } };

export function PostList({ posts, locale }: { posts: Post[]; locale: string }) {
  return (
    <ul className="border-t border-roccia/15">
      {posts.map(({ slug, entry }) => (
        <li key={slug} className="grid gap-4 border-b border-roccia/15 py-5 sm:grid-cols-[9rem_1fr]">
          {entry.cover ? (
            <Photo src={entry.cover} alt="" className="hidden aspect-[4/3] w-full rounded-md object-cover sm:block" />
          ) : (
            <div className="hidden aspect-[4/3] rounded-md bg-neve sm:block" aria-hidden="true" />
          )}
          <div>
            <p className="text-sm text-notte/70">{fmtDate(entry.date!, locale)}</p>
            <Link href={`/blog/${slug}`} className="font-display text-xl font-bold hover:underline">
              {entry.title}
            </Link>
            {entry.summary && <p className="mt-1 line-clamp-2 text-notte/80">{entry.summary}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
