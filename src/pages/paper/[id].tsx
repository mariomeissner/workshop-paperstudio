import {
  Alert,
  Anchor,
  Autocomplete,
  Box,
  Button,
  Flex,
  Group,
  Modal,
  MultiSelect,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { type Paper } from '@prisma/client';
import {
  IconBook,
  IconChevronDown,
  IconChevronUp,
  IconHash,
  IconInfoCircle,
} from '@tabler/icons-react';
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { useSession } from 'next-auth/react';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { useRef, useState } from 'react';
import superjson from 'superjson';
import ChatBox from '~/components/chat-box/chat-box';
import LibraryButton from '~/components/library-button';
import { useGlobalContext } from '~/context/GlobalContext';
import { prisma } from '~/server/db';
import { api } from '~/utils/api';
import { useAddToListMutation } from '~/utils/mutations/listMutations';
import {
  useAddTagMutation,
  useCreateTagMutation,
  useRemoveTagMutation,
} from '~/utils/mutations/tagsMutations';
import { getEntryQuery } from '~/utils/queries/libraryQuery';
import {
  getUserTagsForPaperQuery,
  getUserTagsQuery,
} from '~/utils/queries/tagsQuery';

import PageContainer from '../../components/page-container';

function PaperDetailsPage({
  jsonPaper: jsonString,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // React hooks
  const listSelectRef = useRef<HTMLInputElement>(null);
  const [listSelectError, setListSelectError] = useState(false);
  const [listSelectLoading, setListSelectLoading] = useState(false);
  const { data: session, status } = useSession();
  const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);
  const [isAddToListModalOpen, addToListToggles] = useDisclosure();

  // Session status
  const isSessionUnauthenticated = status === 'unauthenticated';
  const isSessionAuthenticated = status === 'authenticated';

  // Data
  const paper = superjson.parse<Paper>(jsonString);

  // Queries and mutations
  // Library
  const { entry } = getEntryQuery({
    paperId: paper.id,
    userId: session?.user?.id || '',
    enabled: isSessionAuthenticated,
  });
  const isPaperInLibrary = !!entry;

  // Tags
  const addTagMutation = useAddTagMutation();
  const removeTagMutation = useRemoveTagMutation();
  const createTagMutation = useCreateTagMutation();
  const { tags } = getUserTagsForPaperQuery({
    paperId: paper.id,
    userId: session?.user?.id || '',
    enabled: isSessionAuthenticated,
  });
  const { userTags } = getUserTagsQuery({
    userId: session?.user?.id || '',
    enabled: isSessionAuthenticated,
  });

  // Lists
  const { data: userListsData } = api.list.getUserLists.useQuery(undefined, {
    enabled: isSessionAuthenticated,
  });
  const { data: alreadyAddedListsData } =
    api.list.getUserListsWherePaper.useQuery(
      {
        paperId: paper.id,
      },
      { enabled: isSessionAuthenticated },
    );
  const addToListMutation = useAddToListMutation();

  // Chatbox
  const { isChatEnabled } = useGlobalContext();

  // Handlers

  if (!paper) {
    return null;
  }

  return (
    <>
      <NextSeo
        title={paper.title || 'Unknown title' + ' | PaperStudio'}
        description={paper.abstract || 'Unknown abstract'}
        openGraph={{
          title: paper.title || 'Unknown title' + ' | PaperStudio',
          description: paper.abstract || 'Unknown abstract',
          url: `https://paperstudio.app/paper/${paper.arxivId}`,
        }}
      />
      <PageContainer>
        <Modal
          opened={isAddToListModalOpen}
          onClose={addToListToggles.close}
          title="Add paper to a list"
        >
          <Alert
            color="gray"
            icon={<IconInfoCircle size="2rem" />}
            title="Managing lists"
          >
            Create and edit lists from the{' '}
            <Anchor component={Link} href="/lists">
              list management
            </Anchor>{' '}
            page, and they will show up here.
          </Alert>
          <Autocomplete
            withinPortal
            error={listSelectError}
            mt="1rem"
            ref={listSelectRef}
            label="Select a list"
            placeholder="Search for a list"
            data={
              userListsData?.lists
                .map((list) => {
                  return {
                    value: list.name,
                    id: list.id,
                  };
                })
                .filter((list) => {
                  return !alreadyAddedListsData?.lists.find(
                    (alreadyAddedList) => alreadyAddedList.id === list.id,
                  );
                }) || []
            }
            transitionProps={{
              transition: 'pop',
            }}
            onChange={() => {
              setListSelectError(false);
            }}
          />
          <Group position="right" mt="2rem">
            <Button
              variant="subtle"
              onClick={() => {
                addToListToggles.close();
                setListSelectError(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!listSelectRef.current?.value) {
                  setListSelectError(true);
                  return;
                }
                setListSelectLoading(true);
                const selectedListName = listSelectRef.current.value;
                const selectedListId = userListsData?.lists.find(
                  (list) => list.name === selectedListName,
                )?.id;
                if (!selectedListId) {
                  setListSelectLoading(false);
                  return;
                }
                addToListMutation
                  .mutateAsync({
                    listId: selectedListId,
                    paperId: paper.id,
                  })
                  .finally(() => {
                    addToListToggles.close();
                    setListSelectLoading(false);
                  });
              }}
              loading={listSelectLoading}
            >
              Add
            </Button>
          </Group>
        </Modal>

        {/* This Flex wraps main paper details and chat box */}
        <Flex
          direction={{ base: 'column', xl: 'row' }}
          gap="2rem"
          align="start"
        >
          <Box
            sx={{
              flexBasis: '100%',
              '@media (min-width: 90em)': {
                flexBasis: '70%',
              },
            }}
          >
            <Title order={1} size="2rem">
              {paper.title}
            </Title>
            <Text italic size="md" mt="0.5rem" lh={1.3} lineClamp={2}>
              {paper.authors}
            </Text>
            <Text italic size="sm" mt="0.5rem">
              <Group spacing={0} align="center">
                <Text span inherit>
                  Arxiv ID: {paper.arxivId}
                </Text>
                <Text span inherit mx="0.6rem" weight={800}>
                  •
                </Text>
                <Text span inherit>
                  Last updated:{' '}
                  {paper.updateDate
                    ? new Date(paper.updateDate).toLocaleDateString()
                    : 'Unknown'}
                </Text>
              </Group>
            </Text>
            <Group mt="1rem">
              <LibraryButton paperId={paper.id} />
              <Button
                variant="outline"
                color="gray"
                compact
                leftIcon={<IconBook size="1.1rem" />}
                onClick={() => {
                  window.open(
                    `https://arxiv.org/abs/${paper.arxivId}`,
                    '_blank',
                  );
                }}
              >
                View on Arxiv
              </Button>
            </Group>
            {!isSessionUnauthenticated && isPaperInLibrary && (
              <MultiSelect
                mt="0.75rem"
                maw="30rem"
                disabled={!isPaperInLibrary || isSessionUnauthenticated}
                data={
                  userTags?.map((tag) => {
                    return {
                      value: tag.id.toString(),
                      label: tag.name,
                    };
                  }) || []
                }
                value={
                  isPaperInLibrary ? tags?.map((tag) => tag.id.toString()) : []
                }
                placeholder={
                  isPaperInLibrary
                    ? 'Type to find or create a tag'
                    : 'Add paper to library in order to add tags'
                }
                clearButtonProps={{ 'aria-label': 'Clear all tags' }}
                getCreateLabel={(inputValue) => `Create tag "${inputValue}"`}
                icon={<IconHash size="1rem" />}
                transitionProps={{
                  transition: 'pop',
                }}
                onCreate={(query) => {
                  void createTagMutation.mutate({
                    userId: session?.user.id || '',
                    name: query,
                    paperId: paper.id,
                  });
                  return undefined;
                }}
                onChange={(tagIds) => {
                  if (!tagIds) {
                    return;
                  }
                  const addedTags = tagIds.filter(
                    (tagId) => !tags?.find((tag) => tag.id === tagId),
                  );
                  const removedTags = tags?.filter(
                    (tag) => !tagIds.includes(tag.id),
                  );
                  for (const addedTag of addedTags) {
                    void addTagMutation.mutate({
                      userId: session?.user.id || '',
                      paperId: paper.id,
                      tagId: addedTag,
                      name:
                        userTags?.find((tag) => tag.id === addedTag)?.name ||
                        '',
                    });
                  }
                  if (!!removedTags) {
                    for (const removedTag of removedTags) {
                      void removeTagMutation.mutate({
                        name: removedTag.name,
                        userId: session?.user.id || '',
                        paperId: paper.id,
                        tagId: removedTag.id,
                      });
                    }
                  }
                }}
                clearable
                creatable
                searchable
              />
            )}
            <Text
              mt="1rem"
              size="md"
              lineClamp={isAbstractExpanded ? undefined : 3}
            >
              {paper.abstract}
            </Text>
            <Button
              mt="0.5rem"
              variant="outline"
              color="gray"
              leftIcon={
                isAbstractExpanded ? (
                  <IconChevronUp size="1.1rem" />
                ) : (
                  <IconChevronDown size="1.1rem" />
                )
              }
              size="xs"
              onClick={() => {
                setIsAbstractExpanded(!isAbstractExpanded);
              }}
            >
              {isAbstractExpanded ? 'Show less' : 'Show more'}
            </Button>
          </Box>
          <Box
            maw="40rem"
            sx={{
              flexBasis: '100%',
              '@media (min-width: 90em)': {
                flexBasis: '30%',
                marginTop: 0,
              },
            }}
          >
            <ChatBox
              disabled={isSessionUnauthenticated || !isChatEnabled}
              arxivId={paper.arxivId}
              paperTitle={paper.title || 'Unknown title'}
              paperAbstract={paper.abstract || 'No abstract available'}
            />
          </Box>
        </Flex>
      </PageContainer>
    </>
  );
}

export async function getServerSideProps({
  params,
}: GetServerSidePropsContext<{ id: string }>) {
  if (!params) {
    throw new Error('Missing params');
  }

  const paper = await prisma.paper.findUnique({
    where: {
      arxivId: params.id,
    },
  });

  if (!paper) {
    console.log(`Paper ${params.id} not found`);
    return {
      notFound: true,
    };
  }

  console.log(`Found paper ${paper?.title || 'unknown'}}`);
  const jsonPaper = superjson.stringify(paper);
  return {
    props: { jsonPaper: jsonPaper },
  };
}

export default PaperDetailsPage;
