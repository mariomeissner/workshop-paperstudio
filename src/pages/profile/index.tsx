import {
  ActionIcon,
  Avatar,
  Badge,
  Group,
  Menu,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { type GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import PageContainer from '~/components/page-container';
import { getServerAuthSession } from '~/server/auth';
import { prisma } from '~/server/db';

type Props = {
  userName: string;
  userEmail: string;
  userImage: string | null;
};

function ProfilePage({ userName, userEmail, userImage }: Props): JSX.Element {
  const router = useRouter();
  const { status } = useSession();

  if (status === 'unauthenticated') {
    void router.push('/dashboard');
    return <div>Redirecting...</div>;
  }

  return (
    <PageContainer>
      <Group p="xl" spacing="xl" align="center">
        <Avatar
          src={userImage || undefined}
          alt={userName}
          size="8rem"
          radius="8rem"
          mt="0.5rem"
        >
          {userName
            .split(' ')
            .map((name) => name[0])
            .join('')}
        </Avatar>
        <Stack spacing={0}>
          <Title order={2}>{userName}</Title>
          <Text italic ml="0.2rem">
            {userEmail}
          </Text>
          <Group mt="1rem">
            <Badge color="violet" size="xl">
              Free Plan
            </Badge>
            <Menu>
              <Menu.Target>
                <ActionIcon>
                  <IconSettings />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Settings</Menu.Label>
                <Menu.Item component={Link} href={'/profile'}>
                  Profile
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Stack>
      </Group>
    </PageContainer>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  const session = await getServerAuthSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      },
    };
  }
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      email: true,
    },
  });

  if (!user) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {
      userName: user.name || 'Unnamed user',
      userEmail: user.email || 'No email',
      userImage: session.user.image || null,
    },
  };
};

export default ProfilePage;
