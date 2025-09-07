import { createContext, useContext, useState } from 'react';

export type SearchOptions = {
  fields: string[];
  highlight: string;
  fuzzy: string;
};

type GlobalContextType = {
  isChatEnabled: boolean;
  setIsChatEnabled: (value: boolean) => void;
  isNavbarExpanded: boolean;
  setIsNavbarExpanded: (value: boolean) => void;
  searchOptions: SearchOptions;
  setSearchOptions: (value: SearchOptions) => void;
};

const GlobalContext = createContext<GlobalContextType>({
  isChatEnabled: true,
  setIsChatEnabled: () => {
    return;
  },
  isNavbarExpanded: true,
  setIsNavbarExpanded: () => {
    return;
  },
  searchOptions: {
    fields: ['title', 'abstract', 'authors', 'arxivId'],
    highlight: 'false',
    fuzzy: 'true',
  },
  setSearchOptions: () => {
    return;
  },
});

export function useGlobalContext() {
  return useContext(GlobalContext);
}

export function GlobalContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isChatEnabled, setIsChatEnabled] = useState(true);
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(true);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    fields: ['title', 'abstract', 'authors', 'arxivId'],
    highlight: 'false',
    fuzzy: 'true',
  });

  return (
    <GlobalContext.Provider
      value={{
        isChatEnabled,
        setIsChatEnabled,
        isNavbarExpanded,
        setIsNavbarExpanded,
        searchOptions,
        setSearchOptions,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
