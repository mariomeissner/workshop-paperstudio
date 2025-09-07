import { useRouter } from 'next/router';
import { type SearchOptions } from '~/context/GlobalContext';

export function useHandleSearch() {
  const router = useRouter();
  return (query: string, searchOptions: SearchOptions, page = 1) => {
    if (query) {
      void router.push(
        `/search?query=${query}&fields=${searchOptions.fields.join(
          ',',
        )}&highlight=${searchOptions.highlight}&fuzzy=${
          searchOptions.fuzzy
        }&page=${page}`,
      );
    } else {
      void router.push(`/search`);
    }
  };
}
