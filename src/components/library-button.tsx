import { Button, Checkbox, Group, Menu, Tooltip } from '@mantine/core';
import {
  IconCaretDownFilled,
  IconCheck,
  IconPlaylistAdd,
  IconPlaylistX,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import {
  useRemoveEntryMutation,
  useUpsertEntryMutation,
} from '~/utils/mutations/libraryMutations';
import { getEntryQuery } from '~/utils/queries/libraryQuery';

type LibraryButtonProps = {
  paperId: number;
};

export default function LibraryButton({ paperId }: LibraryButtonProps) {
  const [isHoverToRemoveLibrary, setIsHoverToRemoveLibrary] =
    useState<boolean>(false);
  const { data: session, status } = useSession();

  const upsertEntryMutation = useUpsertEntryMutation();
  const removeEntryMutation = useRemoveEntryMutation();
  const { entry, getEntryStatus } = getEntryQuery({
    paperId,
    userId: session?.user?.id || '',
    enabled: status === 'authenticated',
  });
  const isInLibrary = getEntryStatus === 'success' && !!entry;
  const isWantToRead = isInLibrary && entry?.wantToRead;

  const handleAddToLibrary = async (wantToRead?: boolean) => {
    if (status === 'authenticated') {
      try {
        await upsertEntryMutation.mutateAsync({
          paperId,
          userId: session.user.id,
          wantToRead,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      alert('Please sign in to add to library');
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (status === 'authenticated') {
      try {
        await removeEntryMutation.mutateAsync({
          paperId,
          userId: session.user.id,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      alert('Please sign in to remove from library');
    }
  };

  return (
    <Group noWrap spacing={0}>
      <Tooltip
        label={
          isHoverToRemoveLibrary
            ? 'Remove from your library'
            : 'Add to your library'
        }
        width="auto"
      >
        <Button
          compact
          variant={isInLibrary ? 'filled' : 'outline'}
          leftIcon={
            isInLibrary ? (
              isHoverToRemoveLibrary ? (
                <IconPlaylistX size="1.1rem" />
              ) : (
                <IconCheck size="1.1rem" />
              )
            ) : (
              <IconPlaylistAdd size="1.1rem" />
            )
          }
          onMouseEnter={() => {
            if (isInLibrary) {
              setIsHoverToRemoveLibrary(true);
            }
          }}
          onMouseLeave={() => setIsHoverToRemoveLibrary(false)}
          onClick={() => {
            if (isInLibrary) {
              void handleRemoveFromLibrary();
            } else {
              void handleAddToLibrary();
            }
          }}
          sx={(theme) => ({
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderColor: theme.colors.violet[7],
          })}
        >
          Library
        </Button>
      </Tooltip>
      <Menu closeOnItemClick={false}>
        <Menu.Target>
          <Button
            compact
            sx={{
              border: '0',
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          >
            <IconCaretDownFilled size="1.1rem" />
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onClick={() => {
              void handleAddToLibrary(!isWantToRead);
            }}
            icon={
              <Checkbox checked={isWantToRead} style={{ cursor: 'pointer' }} />
            }
          >
            Want to read
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
