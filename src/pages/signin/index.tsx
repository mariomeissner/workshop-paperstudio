import {
  Alert,
  Box,
  Button,
  Center,
  Group,
  PasswordInput,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import PageContainer from '~/components/page-container';

export default function Signup() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordSignIn = async () => {
    setLoading(true);
    try {
      await signIn('credentials', {
        password,
        callbackUrl: '/dashboard',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer isOutside>
      <Center>
        <Stack maw="30rem">
          <Title order={1}>Sign-in</Title>
          <Text>
            This demo uses a simple password to sign in. Enter the shared demo
            password to continue.
          </Text>
          <Alert
            title="PaperStudio is in alpha"
            p="md"
            icon={<IconInfoCircle size="1.2rem" />}
          >
            <Text>
              Only research papers from the Arxiv with an update date on or
              after 2010 and a category of CS are included for now. Data will be
              updated periodically.
            </Text>
            <Text mt="sm">
              While we will do our best to maintain uptime and data persistence,
              we cannot offer any guarantees at this time. Please share your
              feedback and report any issues you encounter.
            </Text>
          </Alert>

          <Box mt="lg">
            <Title order={3}>Password</Title>
            <Text>Enter the demo password provided in the environment.</Text>
            <Text size="sm" color="dimmed" mt={4}>
              Hint: in local dev, try &quot;demo&quot; (see .env.example)
            </Text>
            <Group grow mt="xs">
              <PasswordInput
                placeholder="Enter demo password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
              <Button
                onClick={() => void handlePasswordSignIn()}
                loading={loading}
              >
                Sign in
              </Button>
            </Group>
          </Box>
        </Stack>
      </Center>
    </PageContainer>
  );
}
