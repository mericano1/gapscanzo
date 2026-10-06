import { getTranslations } from 'next-intl/server';

/** Shown on English pages whose content has not been translated yet. */
export async function ItalianOnly() {
  const t = await getTranslations('common');
  return (
    <p lang="en" className="mb-8 max-w-3xl rounded-lg border-l-4 border-larice bg-neve px-4 py-3 text-notte">
      {t('italianOnly')}
    </p>
  );
}
