import { getTranslations } from 'next-intl/server';
import { Photo } from './Photo';

type Props = {
  contacts: readonly { name: string; email: string }[];
  gallery: readonly { image: string; caption: string }[];
};

/** Referenti + gallery shared by activity pages and generic pages. */
export async function Extras({ contacts, gallery }: Props) {
  const t = await getTranslations('common');
  return (
    <>
      {contacts.length > 0 && (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-extrabold">{t('contacts')}</h2>
          <ul className="mt-3 space-y-1">
            {contacts.map((c) => (
              <li key={c.name + c.email}>
                <span className="font-bold">{c.name}</span>{' '}
                {c.email && (
                  <a className="text-roccia underline underline-offset-4" href={`mailto:${c.email}`}>
                    {c.email}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {gallery.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-extrabold">{t('gallery')}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {gallery.map((g) => (
              <li key={g.image}>
                <figure>
                  <Photo src={g.image} alt={g.caption} className="aspect-[4/3] w-full rounded-lg object-cover" />
                  {g.caption && <figcaption className="mt-1 text-sm text-notte/70">{g.caption}</figcaption>}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
