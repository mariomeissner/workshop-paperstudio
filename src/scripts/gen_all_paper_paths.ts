import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function generateAllPaperPaths() {
  try {
    let cursor: number | undefined = undefined;
    let allArxivIds: string[] = [];
    let papers;
    let paperIds: number[] = [];
    let arxivIds: string[] = [];

    do {
      // Fetch a batch of papers from the database
      papers = await prisma.paper.findMany({
        select: {
          id: true,
          arxivId: true,
        },
        cursor: cursor ? { id: cursor } : undefined,
        take: 5000, // Adjust the batch size as per your needs
        skip: cursor ? 1 : undefined,
      });

      // Extract the paper IDs from the batch
      paperIds = papers.map((paper) => paper.id);
      arxivIds = papers.map((paper) => paper.arxivId);

      // Append the paper IDs to the overall list
      allArxivIds = allArxivIds.concat(arxivIds);

      // Update the cursor for the next batch
      cursor = paperIds[paperIds.length - 1];
    } while (cursor);

    // Write the paper IDs to a JSON file
    fs.writeFile('paper_ids.json', JSON.stringify(allArxivIds), (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log('Paper IDs written to paper_ids.json');
      }
    });
  } catch (error) {
    console.error('Error fetching paper IDs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateAllPaperPaths()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
