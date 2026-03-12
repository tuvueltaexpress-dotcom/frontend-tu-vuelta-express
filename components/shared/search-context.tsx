"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface SearchContextType {
  isSearchActive: boolean;
  setSearchActive: (active: boolean) => void;
}

const SearchContext = createContext<SearchContextType>({
  isSearchActive: false,
  setSearchActive: () => {},
});

export function useSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isSearchActive, setSearchActive] = useState(false);

  return (
    <SearchContext.Provider value={{ isSearchActive, setSearchActive }}>
      {children}
    </SearchContext.Provider>
  );
}
