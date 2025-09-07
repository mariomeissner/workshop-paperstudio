import { Loader, Stack } from '@mantine/core';

export default function CenteredLoader() {
  return (
    <Stack justify="center" align="center" style={{ height: '100%' }}>
      <Loader variant="bars" />
    </Stack>
  );
}
