import { Group, Stack, Title } from '@mantine/core';
import type { Paper } from '@prisma/client';
import CenteredLoader from '~/components/centered-loader';
import { api } from '~/utils/api';

import PageContainer from '../../components/page-container';
import PaperEntry from '../../components/paper-entry';

function Dashboard() {
  // Recent papers
  const recentPapersQuery = api.paper.topRecent.useQuery({ take: 10 });
  const recentPapers = recentPapersQuery.data?.papers;

  const papers = recentPapers;
  const isLoading = recentPapersQuery.isLoading;

  return (
    <PageContainer>
      {!isLoading && (
        <Group spacing="xs">
          <Title order={1}>Recent papers</Title>
        </Group>
      )}
      {isLoading ? (
        <CenteredLoader />
      ) : (
        <Stack mt="1rem">
          {papers &&
            papers.map((paper: Paper) => (
              <PaperEntry
                key={paper.arxivId}
                id={paper.arxivId}
                title={paper.title || 'Untitled'}
                authors={paper.authors || 'Unknown'}
                abstract={paper.abstract || 'No abstract'}
              />
            ))}
        </Stack>
      )}
    </PageContainer>
  );
}

export default Dashboard;
