import { createReader } from '@keystatic/core/reader';
import Markdoc, { type Node } from '@markdoc/markdoc';
import React from 'react';
import config from '../../keystatic.config';

export const reader = createReader(process.cwd(), config);

export async function renderMarkdoc(content: () => Promise<{ node: Node }>) {
  const { node } = await content();
  return Markdoc.renderers.react(Markdoc.transform(node), React);
}

export function fmtDate(iso: string, locale: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) {
  return new Intl.DateTimeFormat(locale, { ...opts, timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
}

const byDateDesc = <T extends { entry: { date: string | null } }>(a: T, b: T) => (b.entry.date ?? '').localeCompare(a.entry.date ?? '');

export async function getNews() {
  return (await reader.collections.news.all()).sort(byDateDesc);
}

export async function getFeaturedNews(n: number) {
  const all = await getNews();
  const pinned = all.filter((x) => x.entry.pinned);
  return [...pinned, ...all.filter((x) => !x.entry.pinned)].slice(0, n);
}

export async function getBlog() {
  return (await reader.collections.blog.all()).sort(byDateDesc);
}

export async function getEvents() {
  return (await reader.collections.events.all()).sort((a, b) => (a.entry.startDate ?? '').localeCompare(b.entry.startDate ?? ''));
}

export async function getUpcomingEvents(limit?: number) {
  const today = new Date().toISOString().slice(0, 10);
  const up = (await getEvents()).filter((e) => (e.entry.endDate || e.entry.startDate || '') >= today);
  return limit ? up.slice(0, limit) : up;
}

/** Activity tiles on the home page and in the activities index. */
export const activityTiles: { href: string; slug: string; image: string; label: { it: string; en: string } }[] = [
  { slug: 'alpinismo', href: '/alpinismo', image: 'home_alpinismo', label: { it: 'Alpinismo', en: 'Alpinism' } },
  { slug: 'arrampicata', href: '/attivita/arrampicata', image: 'testata_roccia', label: { it: 'Arrampicata', en: 'Climbing' } },
  { slug: 'escursionismo', href: '/attivita/escursionismo', image: 'home_escursionismo', label: { it: 'Escursionismo', en: 'Hiking' } },
  { slug: 'sci-alpino', href: '/attivita/sci-alpino', image: 'home_scialp2', label: { it: 'Sci alpinismo', en: 'Ski touring' } },
  { slug: 'sci-fondo', href: '/attivita/sci-fondo', image: 'home_fondo', label: { it: 'Sci di fondo', en: 'Cross-country skiing' } },
  { slug: 'alpinismo-giovanile', href: '/attivita/alpinismo-giovanile', image: 'home_attivita_ragazzi', label: { it: 'Alpinismo giovanile', en: 'Youth alpinism' } },
  { slug: 'eventi-sociali', href: '/attivita/eventi-sociali', image: 'home_sociali', label: { it: 'Eventi sociali', en: 'Social events' } },
];

/** Blog posts grouped by year, newest year first. */
export async function getBlogByYear() {
  const byYear = Map.groupBy(await getBlog(), (p) => p.entry.date!.slice(0, 4));
  return [...byYear.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}
