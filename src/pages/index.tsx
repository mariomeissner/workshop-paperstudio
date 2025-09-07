import {
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  keyframes,
} from '@mantine/core';
import {
  IconAt,
  IconCpu,
  IconFileSearch,
  IconFolderStar,
  IconList,
  IconMessage,
  IconSparkles,
} from '@tabler/icons-react';
import { type NextPage } from 'next';
import Link from 'next/link';
import PageContainer from '~/components/page-container';
import DocSearchSvg from '~/illustrations/docsearch';

const float = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, 10px, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
`;

const features = [
  {
    header: 'Discover',
    subheader: 'Find papers that are relevant to you',
    icon1: IconFileSearch,
    description1: (
      <Text>
        <Text span weight={800}>
          Search for papers
        </Text>{' '}
        by content or metadata
      </Text>
    ),
    icon2: IconCpu,
    description2: (
      <Text>
        <Text span weight={800}>
          Get recommendations
        </Text>{' '}
        based on your library
      </Text>
    ),
  },
  {
    header: 'Stay organized',
    subheader: 'Keep track of your papers',
    icon1: IconFolderStar,
    description1: (
      <Text>
        <Text span weight={800}>
          Manage your library
        </Text>{' '}
        by adding and tagging papers
      </Text>
    ),
    icon2: IconList,
    description2: (
      <Text>
        <Text span weight={800}>
          Create and share lists
        </Text>{' '}
        with your colleagues
      </Text>
    ),
  },
  {
    header: 'Supercharge',
    subheader: 'Use AI to gain superpowers',
    icon1: IconMessage,
    description1: (
      <Text>
        <Text span weight={800}>
          Chat with PaperStudio AI
        </Text>{' '}
        about the paper&apos;s content
      </Text>
    ),
    icon2: IconSparkles,
    description2: (
      <Text>
        <Text span weight={800}>
          Get TLDRs and insights
        </Text>{' '}
        from your library
      </Text>
    ),
  },
];

const Landing: NextPage = () => {
  return (
    <PageContainer isOutside showLogo={false}>
      <Flex
        mt="2rem"
        direction={{ base: 'column-reverse', md: 'row' }}
        align={{ base: 'center', md: 'flex-start' }}
        justify={{ base: 'center' }}
      >
        <Title
          order={1}
          mt={{ base: 0, md: '3rem' }}
          ta={{ base: 'center', md: 'right' }}
          fz={{ base: '3rem', md: '3.5rem' }}
          style={{ lineHeight: 0.9, letterSpacing: '-0.04em' }}
        >
          Finally, the modern <br />
          <Text
            span
            inherit
            variant="gradient"
            gradient={{
              from: 'violet.4',
              to: 'violet.9',
              deg: 40,
            }}
          >
            research paper manager
          </Text>{' '}
          <br />
          you have been waiting for.
        </Title>
        <Box
          w="20rem"
          sx={{
            animation: `${float} 5s ease-in-out infinite`,
          }}
        >
          <DocSearchSvg />
        </Box>
      </Flex>
      <Stack mt="4rem" align="center" spacing="sm">
        <Group>
          <Button
            component={Link}
            href="/dashboard"
            size="lg"
            variant="gradient"
            gradient={{
              from: 'violet.4',
              to: 'violet.9',
              deg: 40,
            }}
            sx={{
              transition: 'all 200ms ease',
              boxShadow: '2px 2px 20px 0px rgba(120,42,184,0.3)',
              '&:hover': {
                transform: 'scale(1.03)',
                filter: 'brightness(1.03)',
                shadow: 'lg',
              },
            }}
          >
            Visit dashboard
          </Button>
          {/* Pricing page removed for workshop sandbox */}
        </Group>
        <Text fz="lg" align="center">
          We are in alpha testing. Please send us your feedback!
        </Text>
      </Stack>
      <Flex
        mt="3rem"
        direction={{ base: 'column', md: 'row' }}
        wrap={{ base: 'nowrap', md: 'wrap' }}
        align="center"
        justify="center"
        gap={{ base: '1rem', md: '0rem 4rem' }}
      >
        {features.map((feature, index) => (
          <Box key={index} mt="3rem">
            <Flex direction="column" align="center">
              <Title order={2}>{feature.header}</Title>
              <Text fz="lg">{feature.subheader}</Text>
              <Flex
                mt="0.5rem"
                direction={{ base: 'column', sm: 'row', md: 'column' }}
                align="center"
                justify="center"
                gap={{ base: '0.5rem', sm: '2rem', md: '0.5rem' }}
              >
                {[
                  {
                    icon: feature.icon1,
                    description: feature.description1,
                  },
                  {
                    icon: feature.icon2,
                    description: feature.description2,
                  },
                ].map((item, index) => (
                  <Paper
                    key={index}
                    mt="lg"
                    w="20rem"
                    p="lg"
                    radius="lg"
                    sx={(theme) => ({
                      transition: 'all 200ms ease',
                      '&:hover': {
                        transform: 'translateY(-4px) scale(1.02)',
                        filter: 'brightness(1.05)',
                        shadow: 'lg',
                        '& svg': {
                          transition: 'all 300ms ease',
                          color: theme.colors.violet[6],
                        },
                        '& span': {
                          transition: 'all 300ms ease',
                          color: theme.colors.violet[4],
                        },
                      },
                    })}
                  >
                    <Flex align="center" gap="lg">
                      <item.icon size="4rem" />
                      <Text fz="lg">{item.description}</Text>
                    </Flex>
                  </Paper>
                ))}
              </Flex>
            </Flex>
          </Box>
        ))}
      </Flex>
      <Stack align="center" mt="10rem" justify="center" spacing={0}>
        <Paper
          p="2rem"
          radius="lg"
          sx={(theme) => ({
            transition: 'all 200ms ease',
            border: `1px solid ${theme.colors.gray[9]}`,
            ':hover': {
              border: `1px solid ${theme.colors.violet[6]}`,
            },
          })}
        >
          <Title order={2} align="center">
            Join our mailing list!
          </Title>
          <Text fz="lg" align="center">
            Get updates about our releases and other announcements.
            <br /> No spam.
          </Text>
          {/* Newsletter submissions are disabled in the workshop sandbox. */}
          <form noValidate onSubmit={(e) => e.preventDefault()}>
            <Flex
              mt="2rem"
              direction="row"
              align="center"
              gap="1rem"
              wrap="wrap"
              justify="center"
              style={{ alignSelf: 'stretch' }}
            >
              <TextInput
                placeholder="Your email"
                type="email"
                name="email"
                id="email"
                size="md"
                icon={<IconAt size="0.8rem" />}
                styles={{
                  root: {
                    flexGrow: 1,
                    maxWidth: '22rem',
                  },
                }}
              />
              <Button
                size="md"
                type="submit"
                variant="gradient"
                gradient={{
                  from: 'violet.4',
                  to: 'violet.9',
                  deg: 40,
                }}
              >
                Join
              </Button>
            </Flex>
          </form>
        </Paper>
      </Stack>
    </PageContainer>
  );
};

export default Landing;
