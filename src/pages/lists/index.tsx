import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Menu,
  Modal,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { type List } from '@prisma/client';
import {
  IconCalendarEvent,
  IconCopy,
  IconDotsVertical,
  IconFileDescription,
  IconInfoCircle,
  IconLock,
  IconLockOpen,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';
import CreateListDialog from '~/components/modals/create-list-dialog';
import { api } from '~/utils/api';
import {
  useChangeListPrivacyMutation,
  useCreateListMutation,
  useDeleteListMutation,
} from '~/utils/mutations/listMutations';

import PageContainer from '../../components/page-container';

function ListEntry({
  list,
  onChangePrivacy,
  onDelete,
}: {
  list: List & {
    _count: {
      entries: number;
    };
  };
  onChangePrivacy: (listId: string, isPublic: boolean) => void;
  onDelete: (listId: string) => void;
}) {
  const papersString = list._count.entries === 1 ? 'paper' : 'papers';
  const privacyString = list.public ? 'Public' : 'Private';
  return (
    <Paper
      maw="35rem"
      p="1rem"
      withBorder
      sx={(theme) => ({
        transition: 'all 200ms ease',
        '&:hover': {
          borderColor: theme.colors.violet[6],
          backgroundColor: theme.colors.dark[6],
        },
      })}
    >
      <Group position="apart" align="start" noWrap>
        <Stack spacing="xs">
          <Text
            weight={650}
            lh={1.1}
            size="xl"
            component={Link}
            href={`/lists/${list.id}`}
            sx={{
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {list.name}
          </Text>
          <Text size="sm" color="gray.5">
            <Group spacing={0} align="center">
              <IconCalendarEvent size="1.2rem" stroke={1.5} />
              <Text span inherit ml="0.3rem">
                {new Date(list.createdAt).toLocaleDateString()}
              </Text>
              <Text span inherit mx="0.8rem" weight={800}>
                •
              </Text>
              <IconFileDescription size="1.2rem" stroke={1.5} />
              <Text span inherit ml="0.3rem">
                {`${list._count.entries} ${papersString}`}
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
                {privacyString}
              </Text>
            </Group>
          </Text>
        </Stack>
        <Menu>
          <Menu.Target>
            <ActionIcon>
              <IconDotsVertical size="1.5rem" stroke={1.5} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              icon={
                list.public ? (
                  <IconLock size="1.2rem" stroke={1.5} />
                ) : (
                  <IconLockOpen size="1.2rem" stroke={1.5} />
                )
              }
              onClick={() => onChangePrivacy(list.id, !list.public)}
            >
              {list.public ? 'Make private' : 'Make public'}
            </Menu.Item>
            <Menu.Item icon={<IconCopy size="1.2rem" stroke={1.5} />} disabled>
              Duplicate
            </Menu.Item>
            <Menu.Item
              icon={<IconPencil size="1.2rem" stroke={1.5} />}
              disabled
            >
              Rename
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red.5"
              icon={<IconTrash size="1.2rem" stroke={1.5} />}
              onClick={() => onDelete(list.id)}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Paper>
  );
}

function Lists() {
  const { data: session, status } = useSession();
  const { data: userListData } = api.list.getUserLists.useQuery(undefined, {
    enabled: !!session?.user.id,
  });
  const userLists = userListData?.lists;
  const createListMutation = useCreateListMutation();
  const changeListPrivacyMutation = useChangeListPrivacyMutation();
  const deleteListMutation = useDeleteListMutation();
  const [selectedListId, setSelectedListId] = React.useState<string | null>(
    null,
  );
  const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false);
  const [createListLoading, setCreateListLoading] = React.useState(false);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

  if (status === 'loading') {
    return (
      <PageContainer>
        <></>
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
            <Button component={Link} mt="1rem" href="/signin">
              Sign in
            </Button>
          </Alert>
        </Group>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Modal
        opened={deleteAlertOpen}
        onClose={() => setDeleteAlertOpen(false)}
        title="Delete list"
        size="sm"
      >
        <Stack spacing="1.5rem">
          <Text>
            Are you sure you want to delete this list? This action cannot be
            undone.
          </Text>
          <Group position="right" spacing="sm" align="center" noWrap>
            <Button variant="outline" onClick={() => setDeleteAlertOpen(false)}>
              Cancel
            </Button>
            <Button
              color="red.5"
              onClick={() => {
                setDeleteAlertOpen(false);
                if (selectedListId) {
                  void deleteListMutation.mutateAsync({
                    listId: selectedListId,
                  });
                }
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      <CreateListDialog
        open={createModalOpen}
        setOpen={setCreateModalOpen}
        loading={createListLoading}
        onCreate={(name, privacy) => {
          setCreateListLoading(true);
          createListMutation
            .mutateAsync({
              name,
              privacy,
            })
            .finally(() => {
              setCreateListLoading(false);
              setCreateModalOpen(false);
            });
        }}
      />
      <Group spacing="lg" align="center">
        <Title order={1}>Your lists</Title>
        <Button
          mt="0.5rem"
          variant="outline"
          onClick={() => setCreateModalOpen(true)}
        >
          Create list
        </Button>
      </Group>
      <Stack spacing="1.5rem" mt="2rem">
        {userLists?.map((list) => (
          <ListEntry
            key={list.id}
            list={list}
            onDelete={() => {
              setSelectedListId(list.id);
              setDeleteAlertOpen(true);
            }}
            onChangePrivacy={(listId, isPublic) => {
              void changeListPrivacyMutation.mutateAsync({
                listId,
                privacy: isPublic ? 'public' : 'private',
              });
            }}
          />
        ))}
      </Stack>
    </PageContainer>
  );
}

export default Lists;
