import { ActionIcon, Group, Menu, Stack, Text, Title } from '@mantine/core';
import {
  IconCalendarPlus,
  IconDotsVertical,
  IconFileDescription,
  IconLock,
  IconLockOpen,
  IconRefresh,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import PageContainer from '~/components/page-container';
import PaperEntry from '~/components/paper-entry';
import { api } from '~/utils/api';
import { useRemoveSinglePaperFromListMutation } from '~/utils/mutations/listMutations';

function ListDetailsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { id: idQuery } = router.query;
  const id = idQuery?.toString() ?? '';

  const removeSinglePaperFromlistMutation =
    useRemoveSinglePaperFromListMutation();

  const { data: listData, status: listQueryStatus } = api.list.getList.useQuery(
    {
      listId: id,
    },
    {
      enabled: !!id,
    },
  );
  const list = listData?.list;

  // Handle invalid IDs
  if (
    !id ||
    listQueryStatus === 'error' ||
    !list ||
    (list.public === false && session?.user?.id !== list.user.id)
  ) {
    return (
      <PageContainer>
        <Title order={1}>List not found</Title>
        <Text size="sm" mt="0.5rem" color="gray.5">
          The list you are looking for does not exist, or you do not have
          permission to view it.
        </Text>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Title order={1}>{list.name}</Title>
      <Text size="sm" mt="0.5rem" color="gray.5">
        <Group spacing={0} align="center">
          <IconCalendarPlus size="1.2rem" stroke={1.5} />
          <Text span inherit ml="0.3rem">
            {`${new Date(list.createdAt).toLocaleDateString()}`}
          </Text>
          <Text span inherit mx="0.8rem" weight={800}>
            •
          </Text>
          <IconRefresh size="1.2rem" stroke={1.5} />
          <Text span inherit ml="0.3rem">
            {`${new Date(list.updatedAt).toLocaleDateString()}`}
          </Text>
          <Text span inherit mx="0.8rem" weight={800}>
            •
          </Text>
          <IconFileDescription size="1.2rem" stroke={1.5} />
          <Text span inherit ml="0.3rem">
            {`${list.entries.length} ${
              list.entries.length === 1 ? 'paper' : 'papers'
            }`}
          </Text>
          <Text span inherit mx="0.8rem" weight={800}>
            •
          </Text>
          {list.public ? (
            <IconLockOpen size="1.2rem" stroke={1.5} />
          ) : (
            <IconLock size="1.2rem" stroke={1.5} />
          )}
          <Text span inherit ml="0.3rem">
            {list.public ? 'Public' : 'Private'}
          </Text>
          {list.public && (
            <>
              <Text span inherit mx="0.8rem" weight={800}>
                •
              </Text>
              <IconUser size="1.2rem" stroke={1.5} />
              <Text span inherit ml="0.3rem">
                {list.user.name}
              </Text>
            </>
          )}
        </Group>
      </Text>
      <Stack mt="2rem" spacing="1rem">
        {list.entries.map((entry) => (
          <PaperEntry
            id={entry.paper.arxivId}
            key={entry.paper.arxivId}
            title={entry.paper.title ?? ''}
            authors={entry.paper.authors ?? ''}
            abstract={entry.paper.abstract ?? ''}
            topRightButton={
              session?.user?.id === list.user.id ? (
                <Menu>
                  <Menu.Target>
                    <ActionIcon onClick={(event) => event.preventDefault()}>
                      <IconDotsVertical size="1.2rem" />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      color="red.5"
                      icon={<IconTrash size="1.2rem" />}
                      onClick={() => {
                        void removeSinglePaperFromlistMutation.mutateAsync({
                          listId: id,
                          paperId: entry.paper.id,
                        });
                      }}
                    >
                      Remove
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : undefined
            }
          />
        ))}
      </Stack>
    </PageContainer>
  );
}

export default ListDetailsPage;
