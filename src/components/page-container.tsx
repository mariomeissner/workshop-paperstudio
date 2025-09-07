import {
  ActionIcon,
  AppShell,
  Avatar,
  Burger,
  Button,
  type ButtonProps,
  Divider,
  Group,
  Header,
  Kbd,
  MediaQuery,
  Menu,
  Navbar,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  px,
} from '@mantine/core';
import {
  getHotkeyHandler,
  useDisclosure,
  useHotkeys,
  useViewportSize,
} from '@mantine/hooks';
import {
  IconBooks,
  IconFlame,
  IconHome,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogin,
  IconLogout,
  IconSearch,
} from '@tabler/icons-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import Footer from '~/components/footer/footer';
import { useGlobalContext } from '~/context/GlobalContext';
import { useHandleSearch } from '~/utils/handlers/handle-search';

type Props = {
  hideNavBar?: boolean;
  isOutside?: boolean;
  showLogo?: boolean;
  children: React.ReactNode;
};

const links = [
  {
    label: 'Dashboard',
    link: 'dashboard',
    icon: <IconHome size="1.7rem" />,
  },
  { label: 'Library', link: 'library', icon: <IconBooks size="1.7rem" /> },
  // { label: 'Lists', link: 'lists', icon: <IconListDetails size="1.7rem" /> },
  {
    label: 'Rankings',
    link: 'rankings',
    icon: <IconFlame size="1.7rem" />,
    disabled: true,
  },
];

function PaperStudioButton(props: ButtonProps) {
  return (
    <Button variant="subtle" component={Link} href="/" {...props}>
      <Text
        variant="gradient"
        gradient={{ from: 'violet.5', to: 'violet.9', deg: 45 }}
        size="xl"
        weight={700}
      >
        PaperStudio
      </Text>
    </Button>
  );
}

function NavbarButton({
  link,
  children,
  currentPath,
  isSubpage,
  shouldExpandNavbar,
}: {
  link: (typeof links)[0];
  children: React.ReactNode;
  currentPath: string;
  isSubpage: boolean;
  shouldExpandNavbar: boolean;
}) {
  const isCurrentPath = currentPath === link.link && !isSubpage;
  return (
    <Button
      key={link.label}
      variant="subtle"
      color="violet.0"
      component={Link}
      href={`/${link.link}`}
      leftIcon={link.icon}
      px={shouldExpandNavbar ? 'md' : 0}
      styles={(theme) => ({
        root: {
          height: 44,
          borderRadius: theme.radius.md,
          backgroundColor: isCurrentPath ? theme.colors.violet[6] : undefined,
          color: link.disabled ? theme.colors.gray[7] : undefined,
          pointerEvents: isCurrentPath || link.disabled ? 'none' : undefined,
        },
        inner: {
          justifyContent: shouldExpandNavbar ? 'flex-start' : 'center',
        },
        leftIcon: {
          marginRight: shouldExpandNavbar ? 8 : 0,
        },
      })}
    >
      {children}
    </Button>
  );
}

function LogInOutButton({
  type,
  children,
  shouldExpandNavbar,
}: {
  type: 'login' | 'logout';
  children: React.ReactNode;
  shouldExpandNavbar: boolean;
}) {
  const router = useRouter();
  return (
    <Button
      variant="subtle"
      color="violet.0"
      onClick={
        type === 'login'
          ? () => void router.push('/signin')
          : () => void signOut()
      }
      leftIcon={
        type === 'login' ? (
          <IconLogin size="1.7rem" />
        ) : (
          <IconLogout size="1.7rem" />
        )
      }
      px={shouldExpandNavbar ? 'md' : 0}
      styles={(theme) => ({
        root: {
          height: 44,
          borderRadius: theme.radius.lg,
        },
        inner: {
          justifyContent: shouldExpandNavbar ? 'flex-start' : 'center',
        },
        leftIcon: {
          marginRight: shouldExpandNavbar ? 8 : 0,
        },
      })}
    >
      {children}
    </Button>
  );
}

function PageContainer({ isOutside = false, children }: Props) {
  const [mobileNavbarOpened, { toggle: toggleMobileNavbarOpened }] =
    useDisclosure(false);
  const { isNavbarExpanded, setIsNavbarExpanded, searchOptions } =
    useGlobalContext();
  const { data: session, status } = useSession();
  const router = useRouter();
  const currentPath = router.pathname.split('/')[1];
  const isSubpage = router.pathname.split('/').length > 2;

  const { width } = useViewportSize();
  const isWidthSmallerThanSm = width <= px('48rem') && width !== 0;
  const shouldExpandNavbar = isNavbarExpanded || isWidthSmallerThanSm;
  const searchbarRef = React.useRef<HTMLInputElement>(null);
  const [, setSearchbarFocused] = useState(false);
  useHotkeys([
    ['/', () => searchbarRef.current?.focus()],
    ['meta+k', () => searchbarRef.current?.focus()],
    ['ctrl+k', () => searchbarRef.current?.focus()],
  ]);
  const searchQuery = router.query.query?.toString() || '';
  const handleSearch = useHandleSearch();

  return (
    <>
      <AppShell
        layout={isWidthSmallerThanSm ? undefined : 'alt'}
        navbarOffsetBreakpoint={'sm'}
        asideOffsetBreakpoint={'sm'}
        navbar={
          isOutside ? undefined : (
            <Navbar
              p="sm"
              width={{ base: shouldExpandNavbar ? 280 : 80 }}
              hiddenBreakpoint="sm"
              hidden={!mobileNavbarOpened}
              style={{ transition: 'width 0.2s ease' }}
            >
              <Navbar.Section>
                <Group
                  position="apart"
                  align="center"
                  h={50}
                  pl={8}
                  pr={4}
                  pb={7}
                  noWrap
                >
                  <PaperStudioButton
                    style={{
                      display: shouldExpandNavbar ? undefined : 'none',
                    }}
                  />
                  <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
                    <ActionIcon
                      size="xl"
                      onClick={() => setIsNavbarExpanded(!shouldExpandNavbar)}
                    >
                      {shouldExpandNavbar ? (
                        <IconLayoutSidebarLeftCollapse size="1.7rem" />
                      ) : (
                        <IconLayoutSidebarLeftExpand size="1.7rem" />
                      )}
                    </ActionIcon>
                  </MediaQuery>
                </Group>
              </Navbar.Section>
              <Divider />
              <Navbar.Section grow component={ScrollArea}>
                <Stack
                  mt={'md'}
                  px={shouldExpandNavbar ? 16 : 4}
                  pt={16}
                  spacing={'xs'}
                >
                  {links.map((link) => (
                    <NavbarButton
                      link={link}
                      key={link.label}
                      isSubpage={isSubpage}
                      currentPath={currentPath || ''}
                      shouldExpandNavbar={shouldExpandNavbar}
                    >
                      {shouldExpandNavbar && link.label}
                    </NavbarButton>
                  ))}
                </Stack>
              </Navbar.Section>
              <Navbar.Section>
                <Stack
                  mt={'md'}
                  px={shouldExpandNavbar ? 16 : 4}
                  pt={16}
                  spacing={'xs'}
                >
                  {status === 'authenticated' ? (
                    <LogInOutButton
                      type="logout"
                      shouldExpandNavbar={shouldExpandNavbar}
                    >
                      {shouldExpandNavbar && 'Sign out'}
                    </LogInOutButton>
                  ) : (
                    <LogInOutButton
                      type="login"
                      shouldExpandNavbar={shouldExpandNavbar}
                    >
                      {shouldExpandNavbar && 'Sign in'}
                    </LogInOutButton>
                  )}
                </Stack>
              </Navbar.Section>
            </Navbar>
          )
        }
        header={
          <Header height={64} p={0}>
            {/* This separates items into left and right side */}
            <Group
              position="apart"
              align="center"
              px={32}
              sx={{ height: 64 }}
              noWrap
            >
              {/* Left side */}
              <Group spacing={0} noWrap>
                {isOutside ? undefined : (
                  <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                    <Burger
                      opened={mobileNavbarOpened}
                      onClick={toggleMobileNavbarOpened}
                      size="sm"
                      mr="xl"
                    />
                  </MediaQuery>
                )}
                {isOutside ? (
                  <PaperStudioButton />
                ) : (
                  <Group spacing={0} noWrap>
                    <TextInput
                      defaultValue={searchQuery}
                      placeholder="Search"
                      size="sm"
                      ref={searchbarRef}
                      onFocus={() => setSearchbarFocused(true)}
                      onBlur={() => setSearchbarFocused(false)}
                      styles={{
                        input: {
                          width: isWidthSmallerThanSm ? undefined : '20rem',
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                        },
                        root: {},
                      }}
                      rightSection={
                        !isWidthSmallerThanSm && <Kbd size="sm">/</Kbd>
                      }
                      onKeyUp={getHotkeyHandler([
                        ['Escape', () => searchbarRef.current?.blur()],
                        [
                          'Enter',
                          () => {
                            if (searchbarRef.current?.value) {
                              handleSearch(
                                searchbarRef.current?.value,
                                searchOptions,
                              );
                            }
                          },
                        ],
                      ])}
                    />
                    <Button
                      onClick={() => {
                        if (searchbarRef.current?.value) {
                          handleSearch(
                            searchbarRef.current?.value,
                            searchOptions,
                          );
                        }
                      }}
                      sx={{
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                      }}
                    >
                      <IconSearch size="1.2rem" />
                    </Button>
                  </Group>
                )}
              </Group>

              {/* Right side */}
              <Group spacing={32}>
                {/* {isOutside ? (
                  <Button
                    component={Link}
                    href={'/dashboard'}
                    variant="gradient"
                    gradient={{ from: 'violet.5', to: 'violet.9', deg: 45 }}
                    size="sm"
                  >
                    Get started
                  </Button>
                ) : undefined} */}
                {status === 'unauthenticated' && (
                  <Button
                    variant="gradient"
                    gradient={{ from: 'violet.5', to: 'violet.9', deg: 45 }}
                    size="sm"
                    onClick={() => void router.push('/signin')}
                  >
                    Sign in
                  </Button>
                )}
                {status === 'authenticated' ? (
                  <Menu position="bottom-end">
                    <Menu.Target>
                      <ActionIcon>
                        <Avatar
                          src={session?.user.image}
                          alt="User avatar"
                          radius="xl"
                          size={32}
                          sx={{
                            pointerEvents: 'all',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              filter: 'brightness(1.1)',
                              cursor: 'pointer',
                            },
                          }}
                        />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item href={'/profile'} component={Link}>
                        Profile
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item onClick={() => void signOut()}>
                        Log out
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                ) : undefined}
              </Group>
            </Group>
          </Header>
        }
        footer={<Footer />}
      >
        {children}
      </AppShell>
    </>
  );
}

export default PageContainer;
