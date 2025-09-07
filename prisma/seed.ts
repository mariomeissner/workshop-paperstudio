import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Demo user used to own tags/lists/library entries
  const demoUser = await prisma.user.upsert({
    where: { id: 'demo-user' },
    update: {},
    create: {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@example.com',
      image: null,
    },
  });

  // Demo papers
  const papers = await prisma.$transaction([
    prisma.paper.create({
      data: {
        arxivId: '2301.00001',
        title: 'Understanding Transformers in Practice',
        authors: 'A. Researcher, B. Scientist',
        abstract:
          'We present a practical overview of transformer architectures with tips and pitfalls.',
        categories: 'cs.CL',
        updateDate: new Date(),
      },
    }),
    prisma.paper.create({
      data: {
        arxivId: '2302.00002',
        title: 'A Survey on Vector Databases',
        authors: 'C. Engineer, D. Analyst',
        abstract:
          'This survey reviews vector database systems and similarity search approaches.',
        categories: 'cs.DB',
        updateDate: new Date(),
      },
    }),
    prisma.paper.create({
      data: {
        arxivId: '2303.00003',
        title: 'Program Synthesis with LLMs',
        authors: 'E. Developer, F. Architect',
        abstract:
          'We explore program synthesis capabilities of large language models across tasks.',
        categories: 'cs.AI',
        updateDate: new Date(),
      },
    }),
  ]);

  // Demo tags
  const tagReading = await prisma.tag.create({
    data: { name: 'reading-list', userId: demoUser.id },
  });
  const tagImportant = await prisma.tag.create({
    data: { name: 'important', userId: demoUser.id },
  });

  // Tag on first paper
  await prisma.tagOnPaper.create({
    data: { tagId: tagReading.id, paperId: papers[0]!.id },
  });

  // Demo list with entries
  const list = await prisma.list.create({
    data: {
      name: 'Demo List',
      userId: demoUser.id,
      public: true,
      entries: {
        create: [{ paperId: papers[1]!.id }, { paperId: papers[2]!.id }],
      },
    },
  });

  // Demo library entries
  await prisma.libraryEntry.create({
    data: { userId: demoUser.id, paperId: papers[0]!.id, wantToRead: true },
  });
  await prisma.libraryEntry.create({
    data: { userId: demoUser.id, paperId: papers[1]!.id, wantToRead: false },
  });

  console.log('Seed complete:', {
    user: demoUser.email,
    papers: papers.length,
    list: list.name,
    tags: [tagReading.name, tagImportant.name],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
