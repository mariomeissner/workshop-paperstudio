import {
  Badge,
  Group,
  Paper,
  Stack,
  Text,
  TypographyStylesProvider,
} from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';
import { IconArxiv } from '~/components/icons/arxiv';

type Props = {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  arxivId?: string;
  updateDate?: string;
  topRightButton?: React.ReactNode;
  tags?: string[];
};

function PaperEntry({
  id,
  title,
  authors,
  abstract,
  arxivId,
  updateDate,
  topRightButton,
  tags,
}: Props) {
  return (
    <Paper
      shadow="lg"
      p="lg"
      maw="65rem"
      withBorder
      component={Link}
      href={`/paper/${id}`}
      sx={(theme) => ({
        transition: 'all 200ms ease',
        '&:hover': {
          borderColor: theme.colors.violet[6],
          backgroundColor: theme.colors.dark[6],
        },
      })}
    >
      <TypographyStylesProvider>
        <Group noWrap align="start" position="apart">
          <Stack spacing={0}>
            <Text
              size="lg"
              weight={700}
              lh={1.2}
              dangerouslySetInnerHTML={{ __html: title }}
              sx={{
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            />
            <Text
              color="gray.5"
              mt="0.5rem"
              italic
              lh={1.2}
              lineClamp={2}
              dangerouslySetInnerHTML={{ __html: authors }}
            />
            {arxivId ? (
              // TODO: This 'details' row should be a separate component
              <Text italic size="sm" mt="0.5rem">
                <Group spacing={0} align="center">
                  <IconArxiv size={'1rem'} />
                  <Text span inherit ml="0.3rem">
                    {arxivId}
                  </Text>
                  <Text span inherit mx="0.6rem" weight={800}>
                    •
                  </Text>
                  <IconCalendar size="1rem" />
                  <Text span inherit ml="0.3rem">
                    {updateDate
                      ? new Date(updateDate).toLocaleDateString()
                      : 'Unknown'}
                  </Text>
                </Group>
              </Text>
            ) : null}
          </Stack>
          {topRightButton}
        </Group>
        {tags && (
          <Group mt="sm" noWrap>
            {tags.map((tag) => (
              <Badge key={tag} size="xs" color="gray">
                {tag}
              </Badge>
            ))}
          </Group>
        )}
        <Text
          mt="sm"
          size="sm"
          lineClamp={3}
          dangerouslySetInnerHTML={{ __html: abstract }}
        />
      </TypographyStylesProvider>
    </Paper>
  );
}

export default PaperEntry;
