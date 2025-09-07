import { type NextApiRequest, type NextApiResponse } from 'next';
import { prisma } from '~/server/db';

const PAGE_SIZE = 10;

// NOTE: This type mirrors the previous OpenSearch response so the UI stays unchanged.
export type SearchResponse = {
  hits: {
    total: { value: number };
    hits: {
      _source: {
        arxivId: string;
        title: string;
        abstract: string;
        authors: string;
        updateDate: string;
      };
      highlight: {
        title?: string[];
        abstract?: string[];
        authors?: string[];
      };
    }[];
  } | null;
};

// Temporary local search adapter using Prisma + SQLite.
// TODO: Replace with a dedicated search engine (e.g., SQLite FTS5/Meilisearch/Typesense).
const search = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, page, fields, highlight } = req.query;
  const q = ((query as string) || '').trim();
  const p = Math.max(parseInt((page as string) || '1', 10) || 1, 1);
  const fieldsList = ((fields as string) || 'title,abstract,authors,arxivId')
    .split(',')
    .filter(Boolean);

  if (!q) {
    const empty: SearchResponse = { hits: { total: { value: 0 }, hits: [] } };
    res.status(200).json(empty);
    return;
  }

  // Build OR filters based on selected fields
  const orFilters = [] as Record<string, unknown>[];
  if (fieldsList.includes('title')) orFilters.push({ title: { contains: q } });
  if (fieldsList.includes('abstract'))
    orFilters.push({ abstract: { contains: q } });
  if (fieldsList.includes('authors'))
    orFilters.push({ authors: { contains: q } });
  if (fieldsList.includes('arxivId'))
    orFilters.push({ arxivId: { contains: q } });

  const where = orFilters.length ? { OR: orFilters } : undefined;

  const [total, results] = await Promise.all([
    prisma.paper.count({ where }),
    prisma.paper.findMany({
      where,
      orderBy: { updateDate: 'desc' },
      skip: (p - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const doHighlight = highlight === 'true';

  // naive highlight synthesis
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rx = new RegExp(esc(q), 'ig');
  const wrap = (s: string) => s.replace(rx, (m) => `<mark>${m}</mark>`);

  const hits = results.map((r) => {
    const base = {
      arxivId: r.arxivId,
      title: r.title || '',
      abstract: r.abstract || '',
      authors: r.authors || '',
      updateDate: r.updateDate ? r.updateDate.toISOString() : '',
    };
    const h: { title?: string[]; abstract?: string[]; authors?: string[] } = {};
    if (doHighlight) {
      if (fieldsList.includes('title') && base.title)
        h.title = [wrap(base.title)];
      if (fieldsList.includes('abstract') && base.abstract)
        h.abstract = [wrap(base.abstract)];
      if (fieldsList.includes('authors') && base.authors)
        h.authors = [wrap(base.authors)];
    }
    return { _source: base, highlight: h };
  });

  const response: SearchResponse = {
    hits: { total: { value: total }, hits },
  };
  res.status(200).json(response);
};

export default search;
