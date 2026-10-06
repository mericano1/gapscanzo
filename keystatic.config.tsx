import { collection, config, fields } from '@keystatic/core';

const cover = fields.image({
  label: 'Immagine di copertina',
  directory: 'public/media/uploads',
  publicPath: '/media/uploads/',
});

const contacts = fields.array(
  fields.object({ name: fields.text({ label: 'Nome' }), email: fields.text({ label: 'Email' }) }),
  { label: 'Referenti', itemLabel: (p) => p.fields.name.value },
);

const gallery = fields.array(
  fields.object({ image: fields.text({ label: 'Immagine' }), caption: fields.text({ label: 'Didascalia' }) }),
  { label: 'Galleria', itemLabel: (p) => p.fields.caption.value || p.fields.image.value },
);

export default config({
  storage: { kind: 'local' },
  ui: { brand: { name: 'GAP Scanzorosciate' } },
  collections: {
    news: collection({
      label: 'News',
      slugField: 'title',
      path: 'content/news/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Titolo' } }),
        date: fields.date({ label: 'Data', validation: { isRequired: true } }),
        summary: fields.text({ label: 'Sommario', multiline: true }),
        cover,
        pinned: fields.checkbox({ label: 'In evidenza in home page' }),
        content: fields.markdoc({ label: 'Testo' }),
      },
    }),
    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: 'content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Titolo' } }),
        date: fields.date({ label: 'Data', validation: { isRequired: true } }),
        summary: fields.text({ label: 'Sommario', multiline: true }),
        cover,
        categories: fields.array(fields.text({ label: 'Categoria' }), { label: 'Categorie', itemLabel: (p) => p.value }),
        tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tag', itemLabel: (p) => p.value }),
        content: fields.markdoc({ label: 'Testo' }),
      },
    }),
    events: collection({
      label: 'Eventi',
      slugField: 'title',
      path: 'content/events/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Titolo' } }),
        startDate: fields.date({ label: 'Data di inizio', validation: { isRequired: true } }),
        startTime: fields.text({ label: 'Ora di inizio (HH:MM)' }),
        endDate: fields.date({ label: 'Data di fine' }),
        endTime: fields.text({ label: 'Ora di fine (HH:MM)' }),
        location: fields.text({ label: 'Luogo' }),
        contact: fields.text({ label: 'Referenti' }),
        contactPhone: fields.text({ label: 'Telefono referente' }),
        contactEmail: fields.text({ label: 'Email referente' }),
        contactUrl: fields.text({ label: 'Link utile' }),
        cost: fields.text({ label: 'Costo' }),
        categories: fields.array(fields.text({ label: 'Categoria' }), { label: 'Categorie', itemLabel: (p) => p.value }),
        tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tag', itemLabel: (p) => p.value }),
        cover,
        content: fields.markdoc({ label: 'Descrizione' }),
      },
    }),
    activities: collection({
      label: 'Attività',
      slugField: 'title',
      path: 'content/activities/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Titolo' } }),
        cover,
        mapLink: fields.text({ label: 'Link mappa' }),
        email: fields.text({ label: 'Email' }),
        contacts,
        gallery,
        content: fields.markdoc({ label: 'Testo' }),
      },
    }),
    pages: collection({
      label: 'Pagine',
      slugField: 'title',
      path: 'content/pages/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Titolo' } }),
        cover,
        mapLink: fields.text({ label: 'Link mappa' }),
        email: fields.text({ label: 'Email' }),
        contacts,
        gallery,
        content: fields.markdoc({ label: 'Testo' }),
      },
    }),
    pagesEn: collection({
      label: 'Pagine (inglese)',
      slugField: 'title',
      path: 'content/pages-en/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        content: fields.markdoc({ label: 'Text' }),
      },
    }),
    activitiesEn: collection({
      label: 'Attività (inglese)',
      slugField: 'title',
      path: 'content/activities-en/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        content: fields.markdoc({ label: 'Text' }),
      },
    }),
  },
});
