import type { Metadata } from 'next';
import { ReactNode } from 'react';

import AuthProvider from '@/auth/AuthProvider';
import { Toaster } from '@/components/ui/toaster';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import 'react-datepicker/dist/react-datepicker.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'MONA AI',
  description: 'Video calling App',
  icons: {
    icon: '/icons/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      {/* <SocketProvider> */}
        <AuthProvider>
          <body className={` bg-dark-2`}>
            <header>
              {/* <SignedOut>
              <SignInButton />
            </SignedOut> */}
              {/* <SignedIn>
              <UserButton />
            </SignedIn> */}
            </header>
            <Toaster />
            {children}
          </body>
        </AuthProvider>
      {/* </SocketProvider> */}
    </html>
  );
}
