// Page where the user can see a list of all the papers they have saved to their library
import {
  ActionIcon,
  Alert,
  Button,
  Checkbox,
  Group,
  Menu,
  MultiSelect,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import PaperEntry from '~/components/paper-entry';
import { api } from '~/utils/api';

import { IconDotsVertical, IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import CenteredLoader from '~/components/centered-loader';
import { useRemoveEntryMutation } from '~/utils/mutations/libraryMutations';
import PageContainer from '../../components/page-container';

function Library() {
  const { data: session, status } = useSession();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [wantToReadChecked, setWantToReadChecked] = useState(false);
  const router = useRouter();

  const papersQuery = api.library.getEntries.useQuery(
    { userId: session?.user?.id || '' },
    { enabled: !!session?.user?.id },
  );
  const tagsQuery = api.user.getUserTags.useQuery(
    { userId: session?.user?.id || '' },
    { enabled: !!session?.user?.id },
  );

  const fullLibrary = papersQuery.data ? papersQuery.data.libraryEntries : null;
  const wantToReadLibrary = fullLibrary?.filter(
    (entry) => entry.wantToRead === true,
  );
  const library = wantToReadChecked ? wantToReadLibrary : fullLibrary;
  const papers = library?.map((entry) => entry.paper);
  const filteredPapers = papers?.filter((paper) => {
    if (!selectedTags.length) return true;
    return (
      paper.tags.length > 0 &&
      selectedTags.every((selectedTag) =>
        paper.tags.some((paperTag) => paperTag.tag.id === selectedTag),
      )
    );
  });
  const userTags = tagsQuery.data?.tags || [];
  const removeLibraryMutation = useRemoveEntryMutation();

  // Duplicated code from paper.tsx, consider refactoring
  const handleRemoveFromLibrary = async (paperId: number) => {
    if (status === 'authenticated') {
      try {
        await removeLibraryMutation.mutateAsync({
          paperId: paperId,
          userId: session.user.id,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      alert('Please sign in to remove from library');
    }
  };

  if (status === 'loading') {
    return (
      <PageContainer>
        <CenteredLoader />
      </PageContainer>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <PageContainer>
        <Group>
          <Alert
            icon={<IconInfoCircle size="1.2rem" />}
            title="Sign in to view this page!"
            p="xl"
          >
            <Text>
              If you sign in, you can create and manage your own library of
              papers,
              <br />
              and organize them with tags.
            </Text>
            <Button mt="1rem" onClick={() => void router.push('/signin')}>
              Sign in
            </Button>
          </Alert>
        </Group>
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      <Title order={1}>Your library</Title>
      <Group mt="0.5rem" align="center" spacing="2rem">
        <MultiSelect
          maw="20rem"
          value={selectedTags}
          onChange={setSelectedTags}
          data={userTags.map((tag) => ({ value: tag.id, label: tag.name }))}
          placeholder="Filter with tags"
          nothingFound="No tags found"
          searchable
        />
        <Checkbox
          checked={wantToReadChecked}
          onChange={(event) =>
            setWantToReadChecked(event.currentTarget.checked)
          }
          label="Filter by 'Want To Read'"
        />
      </Group>
      <Stack mt="1rem">
        {filteredPapers ? (
          filteredPapers.map((paper) => (
            <PaperEntry
              key={paper.arxivId}
              id={paper.arxivId}
              title={paper.title || 'Untitled'}
              authors={paper.authors || 'Unknown'}
              abstract={paper.abstract || 'No abstract'}
              tags={paper.tags.map((tag) => tag.tag.name)}
              topRightButton={
                <Menu>
                  <Menu.Target>
                    <ActionIcon onClick={(event) => event.preventDefault()}>
                      <IconDotsVertical size="1.5rem" stroke={1.5} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown onClick={(event) => event.preventDefault()}>
                    <Menu.Item
                      color="red.5"
                      onClick={() => {
                        void handleRemoveFromLibrary(paper.id).then(() =>
                          papersQuery.refetch(),
                        );
                      }}
                    >
                      Remove from library
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              }
            />
          ))
        ) : (
          <Text mt="1rem">No papers found</Text>
        )}
      </Stack>
    </PageContainer>
  );
}

export default Library;
