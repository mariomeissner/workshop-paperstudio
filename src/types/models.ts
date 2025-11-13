export type Paper = {
  id: number;
  arxivId: string;
  submitter?: string | null;
  authors?: string | null;
  title?: string | null;
  comments?: string | null;
  journalRef?: string | null;
  doi?: string | null;
  reportNo?: string | null;
  categories?: string | null;
  license?: string | null;
  abstract?: string | null;
  updateDate?: string | null;
};

export type Tag = {
  id: string;
  userId: string;
  name: string;
};

export type TagOnPaper = {
  tagId: string;
  paperId: number;
};

export type TagOnPaperWithTag = TagOnPaper & {
  tag: Tag;
};

export type PaperWithTags = Paper & {
  tags: TagOnPaperWithTag[];
};

export type LibraryEntry = {
  paperId: number;
  userId: string;
  wantToRead: boolean;
};

export type LibraryEntryWithPaper = LibraryEntry & {
  paper: PaperWithTags;
};

export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export type List = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  userId: string;
  public: boolean;
};

export type ListEntry = {
  listId: string;
  paperId: number;
};

export type ListWithEntries = List & {
  entries: (ListEntry & { paper: Paper })[];
  user: Pick<User, 'id' | 'name'>;
};
