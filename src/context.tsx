'use client';

import { createContext, useState } from 'react';

export const AppContext = createContext({});

export function AppContextProvider({ children }: { children: any }) {
  const [accessToken, setAccessToken] = useState(null);
  const value = {
    accessToken,
    setAccessToken
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
