import { ReactNode } from 'react';

import StreamVideoProvider from '@/providers/StreamClientProvider';
import { DisplayNameProvider } from '@/providers/DisplayNameContext';

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main>
      <DisplayNameProvider>
        <StreamVideoProvider>{children}</StreamVideoProvider>
      </DisplayNameProvider>
    </main>
  );
};

export default RootLayout;
