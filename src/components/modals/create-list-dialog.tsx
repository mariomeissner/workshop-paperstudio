import {
  Button,
  Group,
  Modal,
  Stack,
  Switch,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import { IconLock, IconLockOpen } from '@tabler/icons-react';
import React from 'react';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  loading: boolean;
  onCreate: (name: string, privacy: 'public' | 'private') => void;
};

function CreateListDialog({ open, setOpen, loading, onCreate }: Props) {
  const [privateChecked, setPrivateChecked] = React.useState(false);
  const listNameRef = React.useRef<HTMLInputElement>(null);
  const [listNameError, setListNameError] = React.useState(false);
  const theme = useMantineTheme();

  return (
    <Modal
      opened={open}
      onClose={() => setOpen(false)}
      title="Create a new list"
      size="sm"
    >
      <Stack spacing="lg">
        <TextInput
          id="list-name"
          label="List name"
          placeholder="My new list"
          onChange={() => setListNameError(false)}
          error={listNameError}
          ref={listNameRef}
          required
        />
        <Switch
          size="md"
          id="privacy"
          label="Private"
          checked={privateChecked}
          onChange={(event) => setPrivateChecked(event.currentTarget.checked)}
          thumbIcon={
            privateChecked ? (
              <IconLock
                size="0.8rem"
                color={theme.colors.violet[8]}
                stroke={3}
              />
            ) : (
              <IconLockOpen
                size="0.8rem"
                color={theme.colors.violet[8]}
                stroke={3}
              />
            )
          }
        />
        <Group mt="0.5rem" position="right" align="center">
          <Button
            variant="outline"
            color="gray"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!listNameRef.current?.value) {
                setListNameError(true);
                return;
              }
              onCreate(
                listNameRef.current.value,
                privateChecked ? 'private' : 'public',
              );
            }}
            loading={loading}
          >
            Create
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default CreateListDialog;
