import {
  type LibraryEntry,
  type LibraryEntryWithPaper,
  type List,
  type ListEntry,
  type ListWithEntries,
  type Paper,
  type PaperWithTags,
  type Tag,
  type TagOnPaper,
  type TagOnPaperWithTag,
  type User,
} from '~/types/models';

/* eslint-disable @typescript-eslint/require-await */

type SearchParams = {
  query: string;
  fields: string[];
  skip?: number;
  take?: number;
};

const clonePaper = (paper: Paper): Paper => ({ ...paper });
const cloneTag = (tag: Tag): Tag => ({ ...tag });

const demoUsers: User[] = [
  {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
    image: null,
  },
];

const demoPapers: Paper[] = [
  {
    id: 1,
    arxivId: '2301.00001',
    title: 'Understanding Transformers in Practice',
    authors: 'A. Researcher, B. Scientist',
    abstract:
      'We present a practical overview of transformer architectures with tips and pitfalls.',
    categories: 'cs.CL',
    updateDate: '2023-01-10T00:00:00.000Z',
  },
  {
    id: 2,
    arxivId: '2302.00002',
    title: 'A Survey on Vector Databases',
    authors: 'C. Engineer, D. Analyst',
    abstract:
      'This survey reviews vector database systems and similarity search approaches.',
    categories: 'cs.DB',
    updateDate: '2023-02-08T00:00:00.000Z',
  },
  {
    id: 3,
    arxivId: '2303.00003',
    title: 'Program Synthesis with LLMs',
    authors: 'E. Developer, F. Architect',
    abstract:
      'We explore program synthesis capabilities of large language models across tasks.',
    categories: 'cs.AI',
    updateDate: '2023-03-15T00:00:00.000Z',
  },
];

const demoTags: Tag[] = [
  { id: 'tag-reading', userId: 'demo-user', name: 'reading-list' },
  { id: 'tag-important', userId: 'demo-user', name: 'important' },
];

const demoTagOnPaper: TagOnPaper[] = [{ tagId: 'tag-reading', paperId: 1 }];

const demoLibraryEntries: LibraryEntry[] = [
  { userId: 'demo-user', paperId: 1, wantToRead: true },
  { userId: 'demo-user', paperId: 2, wantToRead: false },
];

const demoLists: List[] = [
  {
    id: 'list-demo',
    name: 'Demo List',
    userId: 'demo-user',
    public: true,
    createdAt: '2023-04-01T00:00:00.000Z',
    updatedAt: '2023-04-01T00:00:00.000Z',
  },
];

const demoListEntries: ListEntry[] = [
  { listId: 'list-demo', paperId: 2 },
  { listId: 'list-demo', paperId: 3 },
];

const findUser = (userId: string) => demoUsers.find((user) => user.id === userId);
const findPaperRecord = (paperId: number) =>
  demoPapers.find((paper) => paper.id === paperId);
const findTagRecord = (tagId: string) => demoTags.find((tag) => tag.id === tagId);

const ensurePaper = (paperId: number) => {
  const paper = findPaperRecord(paperId);
  if (!paper) throw new Error(`Paper ${paperId} not found`);
  return paper;
};

const getTagsForPaper = (paperId: number): TagOnPaperWithTag[] =>
  demoTagOnPaper
    .filter((relation) => relation.paperId === paperId)
    .map((relation) => {
      const tag = findTagRecord(relation.tagId);
      if (!tag) throw new Error(`Tag ${relation.tagId} not found`);
      return {
        ...relation,
        tag: cloneTag(tag),
      };
    });

const buildPaperWithTags = (paperId: number): PaperWithTags => {
  const paper = ensurePaper(paperId);
  return {
    ...clonePaper(paper),
    tags: getTagsForPaper(paperId),
  };
};

const createId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const toIsoString = (date = new Date()) => date.toISOString();

class DemoDb {
  paper = {
    getById: async (id: number) => {
      const paper = findPaperRecord(id);
      return paper ? clonePaper(paper) : null;
    },
    getByArxivId: async (arxivId: string) => {
      const paper = demoPapers.find((entry) => entry.arxivId === arxivId);
      return paper ? clonePaper(paper) : null;
    },
    getTopRecent: async (take: number) => {
      return demoPapers
        .slice()
        .sort((a, b) => {
          const dateA = a.updateDate ? Date.parse(a.updateDate) : 0;
          const dateB = b.updateDate ? Date.parse(b.updateDate) : 0;
          return dateB - dateA;
        })
        .slice(0, take)
        .map(clonePaper);
    },
    search: async ({ query, fields, skip = 0, take = 10 }: SearchParams) => {
      const normalizedQuery = query.toLowerCase();
      const matches = demoPapers.filter((paper) => {
        return fields.some((field) => {
          const value = (paper as Record<string, unknown>)[field];
          if (typeof value !== 'string') return false;
          return value.toLowerCase().includes(normalizedQuery);
        });
      });
      return matches.slice(skip, skip + take).map(clonePaper);
    },
    count: async ({ query, fields }: SearchParams) => {
      const normalizedQuery = query.toLowerCase();
      return demoPapers.filter((paper) =>
        fields.some((field) => {
          const value = (paper as Record<string, unknown>)[field];
          if (typeof value !== 'string') return false;
          return value.toLowerCase().includes(normalizedQuery);
        }),
      ).length;
    },
  };

  tags = {
    getUserTagsOnPaper: async (userId: string, paperId: number) => {
      return getTagsForPaper(paperId).filter(
        (relation) => relation.tag.userId === userId,
      );
    },
    getByUser: async (userId: string) => {
      return demoTags.filter((tag) => tag.userId === userId).map(cloneTag);
    },
    getById: async (tagId: string) => {
      const tag = findTagRecord(tagId);
      return tag ? cloneTag(tag) : null;
    },
    create: async ({ userId, name }: { userId: string; name: string }) => {
      const tag: Tag = {
        id: createId('tag'),
        userId,
        name,
      };
      demoTags.push(tag);
      return cloneTag(tag);
    },
    attachToPaper: async (tagId: string, paperId: number) => {
      ensurePaper(paperId);
      const existing = demoTagOnPaper.find(
        (relation) => relation.tagId === tagId && relation.paperId === paperId,
      );
      if (!existing) {
        demoTagOnPaper.push({ tagId, paperId });
      }
      const tag = findTagRecord(tagId);
      if (!tag) throw new Error(`Tag ${tagId} not found`);
      return {
        tag: cloneTag(tag),
        tagId,
        paperId,
      };
    },
    removeFromPaper: async (tagId: string, paperId: number) => {
      const index = demoTagOnPaper.findIndex(
        (relation) => relation.tagId === tagId && relation.paperId === paperId,
      );
      if (index !== -1) {
        demoTagOnPaper.splice(index, 1);
        return 1;
      }
      return 0;
    },
    removeManyFromPaper: async (paperId: number, tagIds: string[]) => {
      let count = 0;
      for (const tagId of tagIds) {
        count += await this.tags.removeFromPaper(tagId, paperId);
      }
      return count;
    },
  };

  library = {
    getEntries: async (userId: string): Promise<LibraryEntryWithPaper[]> => {
      return demoLibraryEntries
        .filter((entry) => entry.userId === userId)
        .map((entry) => ({
          ...entry,
          paper: buildPaperWithTags(entry.paperId),
        }));
    },
    upsertEntry: async ({
      userId,
      paperId,
      wantToRead,
    }: {
      userId: string;
      paperId: number;
      wantToRead?: boolean;
    }) => {
      const existing = demoLibraryEntries.find(
        (entry) => entry.userId === userId && entry.paperId === paperId,
      );
      if (existing) {
        if (typeof wantToRead === 'boolean') {
          existing.wantToRead = wantToRead;
        }
        return { ...existing };
      }
      ensurePaper(paperId);
      const entry: LibraryEntry = {
        userId,
        paperId,
        wantToRead: wantToRead ?? false,
      };
      demoLibraryEntries.push(entry);
      return { ...entry };
    },
    removeEntry: async (userId: string, paperId: number) => {
      const index = demoLibraryEntries.findIndex(
        (entry) => entry.userId === userId && entry.paperId === paperId,
      );
      if (index === -1) {
        throw new Error('Library entry not found');
      }
      const [removed] = demoLibraryEntries.splice(index, 1);
      return { ...removed };
    },
    getEntry: async (userId: string, paperId: number) => {
      const entry = demoLibraryEntries.find(
        (item) => item.userId === userId && item.paperId === paperId,
      );
      return entry ? { ...entry } : null;
    },
  };

  lists = {
    getList: async (listId: string): Promise<ListWithEntries | null> => {
      const list = demoLists.find((entry) => entry.id === listId);
      if (!list) return null;
      const entries = demoListEntries
        .filter((entry) => entry.listId === listId)
        .map((entry) => ({
          ...entry,
          paper: clonePaper(ensurePaper(entry.paperId)),
        }));
      const owner = findUser(list.userId);
      return {
        ...list,
        entries,
        user: {
          id: owner?.id ?? 'unknown-user',
          name: owner?.name ?? 'Unknown',
        },
      };
    },
    getUserLists: async (userId: string) => {
      return demoLists
        .filter((list) => list.userId === userId)
        .map((list) => ({
          ...list,
          _count: {
            entries: demoListEntries.filter(
              (entry) => entry.listId === list.id,
            ).length,
          },
        }));
    },
    getUserListsContainingPaper: async (userId: string, paperId: number) => {
      const listIdsContainingPaper = new Set(
        demoListEntries
          .filter((entry) => entry.paperId === paperId)
          .map((entry) => entry.listId),
      );
      return demoLists
        .filter(
          (list) => list.userId === userId && listIdsContainingPaper.has(list.id),
        )
        .map((list) => ({ ...list }));
    },
    createList: async ({
      userId,
      name,
      isPublic,
      paperId,
    }: {
      userId: string;
      name: string;
      isPublic: boolean;
      paperId?: number;
    }) => {
      const list: List = {
        id: createId('list'),
        name,
        userId,
        public: isPublic,
        createdAt: toIsoString(),
        updatedAt: toIsoString(),
      };
      demoLists.push(list);
      if (paperId) {
        ensurePaper(paperId);
        demoListEntries.push({ listId: list.id, paperId });
      }
      return { ...list };
    },
    deleteList: async (listId: string) => {
      const index = demoLists.findIndex((list) => list.id === listId);
      if (index === -1) throw new Error('List not found');
      const [removed] = demoLists.splice(index, 1);
      for (let i = demoListEntries.length - 1; i >= 0; i -= 1) {
        if (demoListEntries[i]?.listId === listId) {
          demoListEntries.splice(i, 1);
        }
      }
      return { ...removed };
    },
    addPaperToList: async (listId: string, paperId: number) => {
      const exists = demoListEntries.some(
        (entry) => entry.listId === listId && entry.paperId === paperId,
      );
      if (exists) throw new Error('Paper already in list');
      ensurePaper(paperId);
      demoListEntries.push({ listId, paperId });
      const list = demoLists.find((entry) => entry.id === listId);
      if (list) list.updatedAt = toIsoString();
    },
    removePaperFromList: async (listId: string, paperId: number) => {
      const initialLength = demoListEntries.length;
      for (let i = demoListEntries.length - 1; i >= 0; i -= 1) {
        if (
          demoListEntries[i]?.listId === listId &&
          demoListEntries[i]?.paperId === paperId
        ) {
          demoListEntries.splice(i, 1);
        }
      }
      const list = demoLists.find((entry) => entry.id === listId);
      if (list && initialLength !== demoListEntries.length) {
        list.updatedAt = toIsoString();
      }
      return initialLength !== demoListEntries.length;
    },
    removeMultipleFromList: async (listId: string, paperIds: number[]) => {
      let removed = 0;
      for (const paperId of paperIds) {
        if (await this.lists.removePaperFromList(listId, paperId)) {
          removed += 1;
        }
      }
      return removed;
    },
    changePrivacy: async (listId: string, isPublic: boolean) => {
      const list = demoLists.find((entry) => entry.id === listId);
      if (!list) throw new Error('List not found');
      list.public = isPublic;
      list.updatedAt = toIsoString();
      return { ...list };
    },
  };

  users = {
    getById: async (userId: string) => {
      const user = findUser(userId);
      return user ? { ...user } : null;
    },
    ensureDemoUser: async ({
      id,
      name,
      email,
    }: {
      id: string;
      name: string;
      email: string;
    }) => {
      const existing = findUser(id);
      if (existing) {
        existing.name = name;
        existing.email = email;
        return { ...existing };
      }
      const user: User = {
        id,
        name,
        email,
        image: null,
      };
      demoUsers.push(user);
      return { ...user };
    },
  };
}

export const demoDb = new DemoDb();

/* eslint-enable @typescript-eslint/require-await */
