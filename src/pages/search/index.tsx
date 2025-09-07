import {
  Alert,
  Checkbox,
  Flex,
  Group,
  Pagination,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import CenteredLoader from '~/components/centered-loader';
import PageContainer from '~/components/page-container';
import PaperEntry from '~/components/paper-entry';
import { useGlobalContext } from '~/context/GlobalContext';
import { useHandleSearch } from '~/utils/handlers/handle-search';
import { useSearchResults } from '~/utils/queries';

function SearchPage() {
  const router = useRouter();
  const queryString = (router.query.query as string) || '';
  const page = (router.query.page as string) || '1';
  const queryFields =
    (router.query.fields as string) || 'title,abstract,authors,arxivId';
  const highlight = (router.query.highlight as string) || 'false';
  const fuzzy = (router.query.fuzzy as string) || 'true';
  const { data, isLoading, isError } = useSearchResults(
    queryString,
    page,
    queryFields,
    highlight,
    fuzzy,
  );
  const { searchOptions, setSearchOptions } = useGlobalContext();
  const handleSearch = useHandleSearch();
  const fieldRefs = {
    titleRef: useRef<HTMLInputElement>(null),
    abstractRef: useRef<HTMLInputElement>(null),
    authorsRef: useRef<HTMLInputElement>(null),
    arxivIdRef: useRef<HTMLInputElement>(null),
  };
  const optionRefs = {
    fuzzyRef: useRef<HTMLInputElement>(null),
    highlightRef: useRef<HTMLInputElement>(null),
  };
  const fields = [
    {
      label: 'Title',
      value: 'title',
      ref: fieldRefs.titleRef,
      checked: searchOptions.fields.includes('title'),
    },
    {
      label: 'Abstract',
      value: 'abstract',
      ref: fieldRefs.abstractRef,
      checked: searchOptions.fields.includes('abstract'),
    },
    {
      label: 'Authors',
      value: 'authors',
      ref: fieldRefs.authorsRef,
      checked: searchOptions.fields.includes('authors'),
    },
    {
      label: 'Arxiv ID',
      value: 'arxivId',
      ref: fieldRefs.arxivIdRef,
      checked: searchOptions.fields.includes('arxivId'),
    },
  ];
  const options = [
    {
      label: 'Fuzzy',
      value: 'fuzzy',
      ref: optionRefs.fuzzyRef,
      checked: searchOptions.fuzzy === 'true',
      tooltip:
        'Fuzzy search enables approximate matching. Currently disabled (no-op) in local mode.',
    },
    {
      label: 'Highlight',
      value: 'highlight',
      ref: optionRefs.highlightRef,
      checked: searchOptions.highlight === 'true',
      tooltip:
        'Highlighting helps to visualize the matched search terms in the results.',
    },
  ];

  // Update search options state based on URL parameters
  useEffect(() => {
    setSearchOptions({
      fields: queryFields.split(','),
      highlight,
      fuzzy,
    });
  }, [queryFields, highlight, fuzzy, setSearchOptions]);

  function updateSearchOptions() {
    const fields = [
      fieldRefs.titleRef.current?.checked ? 'title' : '',
      fieldRefs.abstractRef.current?.checked ? 'abstract' : '',
      fieldRefs.authorsRef.current?.checked ? 'authors' : '',
      fieldRefs.arxivIdRef.current?.checked ? 'arxivId' : '',
    ].filter((field) => field !== '');
    const highlight = optionRefs.highlightRef.current?.checked
      ? 'true'
      : 'false';
    const fuzzy = optionRefs.fuzzyRef.current?.checked ? 'true' : 'false';

    setSearchOptions({
      fields,
      highlight,
      fuzzy,
    });
  }

  if (isLoading) {
    return (
      <PageContainer>
        <CenteredLoader />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <Alert color="red" title="Error" p="xl">
          Something went wrong while loading search results
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Title order={1}>Search</Title>
      <Alert color="gray" mt="sm" title="Note">
        Search currently uses local database matching. Advanced features like
        fuzzy ranking, highlighting, and “more like this” will return later.
      </Alert>
      <Flex mt="1rem" rowGap="1rem" columnGap="4rem" wrap="wrap">
        <Stack spacing="0.5rem">
          <Title order={4}>Fields</Title>
          <Group>
            {fields.map((entry) => (
              <Checkbox
                size="sm"
                label={entry.label}
                value={entry.value}
                key={entry.value}
                ref={entry.ref}
                defaultChecked={entry.checked}
                onChange={updateSearchOptions}
              />
            ))}
          </Group>
        </Stack>
        <Stack spacing="0.5rem">
          <Title order={4}>Options</Title>
          <Group noWrap>
            {options.map((entry) => (
              <Checkbox
                size="sm"
                label={
                  <Tooltip label={entry.tooltip}>
                    <Text underline sx={{ textDecorationStyle: 'dashed' }}>
                      {entry.label}
                    </Text>
                  </Tooltip>
                }
                value={entry.value}
                key={entry.value}
                ref={entry.ref}
                defaultChecked={entry.checked}
                onChange={updateSearchOptions}
                disabled={entry.value === 'fuzzy'}
              />
            ))}
          </Group>
        </Stack>
      </Flex>
      <Stack mt="1rem" h="100%">
        {data?.hits?.hits.map((hit) => (
          <PaperEntry
            id={hit._source.arxivId}
            key={hit._source.arxivId}
            title={hit.highlight?.title?.[0] || hit._source.title}
            abstract={hit.highlight?.abstract?.[0] || hit._source.abstract}
            authors={hit.highlight?.authors?.[0] || hit._source.authors}
            arxivId={hit._source.arxivId}
            updateDate={hit._source.updateDate}
          />
        ))}
        {!data ||
          (data.hits?.total.value === 0 && (
            <Alert
              color="gray"
              title="No results found"
              p="xl"
              style={{ justifySelf: 'center' }}
            >
              Try changing your search query or options
            </Alert>
          ))}
        {data.hits?.hits.length && data.hits.hits.length < 10 && (
          <Alert
            color="gray"
            title="End of results"
            p="xl"
            style={{ justifySelf: 'center' }}
          >
            There are no more results to show
          </Alert>
        )}
        <Pagination
          total={
            data.hits?.total.value && data.hits.total.value < 100
              ? data.hits.total.value / 10 + 1
              : 10
          }
          value={parseInt(page)}
          onChange={(page) => {
            handleSearch(
              queryString,
              { fuzzy, highlight, fields: queryFields.split(',') },
              page,
            );
          }}
          sx={{ justifySelf: 'end' }}
        />
      </Stack>
    </PageContainer>
  );
}

export default SearchPage;
