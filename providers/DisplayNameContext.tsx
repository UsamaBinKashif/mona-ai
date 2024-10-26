"use client"
// context/DisplayNameContext.tsx
import { createContext, useState, ReactNode } from 'react';

interface DisplayNameContextType {
  displayName: string;
  setDisplayName: (name: string) => void;
}

export const DisplayNameContext = createContext<DisplayNameContextType>({
  displayName: '',
  setDisplayName: () => {},
});

export const DisplayNameProvider = ({ children }: { children: ReactNode }) => {
  const [displayName, setDisplayName] = useState('');

  return (
    <DisplayNameContext.Provider value={{ displayName, setDisplayName }}>
      {children}
    </DisplayNameContext.Provider>
  );
};
