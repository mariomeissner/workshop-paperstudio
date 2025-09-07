import {
  useQuery,
  type QueryFunction,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { type SearchResponse } from '../pages/api/search';

const SEARCH_QUERY_KEY = 'searchResults';

const fetchSearchResults: QueryFunction<SearchResponse, string[]> = async ({
  queryKey,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const queryString = queryKey[1]!;
  const page = queryKey[2] || '1';
  const fields =
    queryKey[3] || ['title', 'abstract', 'authors', 'arxivId'].join(',');
  const highlight = queryKey[4] || 'false';
  const fuzzy = queryKey[5] || 'true';
  const url = `/api/search?query=${queryString}&page=${page}&fields=${fields}&highlight=${highlight}&fuzzy=${fuzzy}`;

  const response = await fetch(url);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data: SearchResponse = await response.json();
  return data;
};

export const useSearchResults = (
  searchQuery: string,
  page: string,
  fields: string,
  highlight: string,
  fuzzy: string,
) => {
  return useQuery(
    [SEARCH_QUERY_KEY, searchQuery, page, fields, highlight, fuzzy],
    fetchSearchResults,
    {
      enabled: !!searchQuery,
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  );
};

export const useSubmitChatMessage = (
  message: string,
  options?: UseQueryOptions<SearchResponse, Error, QueryKey>,
) => {
  return useQuery<SearchResponse, Error, QueryKey>(
    ['submitChatMessage', message],
    async () => {
      const response = await fetch(`/api/chat?message=${message}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: SearchResponse = await response.json();
      return data;
    },
    options,
  );
};
