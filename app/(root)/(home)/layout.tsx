import { Metadata } from 'next';
import { ReactNode } from 'react';

import Navbar from '@/components/Navbar';
import { WavyBackground } from '@/components/ui/wavy-background';

export const metadata: Metadata = {
  title: 'MONA AI',
  description: 'A workspace for your team, powered by Stream Chat and Clerk.',
};

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main className="relative overflow-hidden">
      <WavyBackground >
        <Navbar />

        <div className="flex">
          <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-10  sm:px-14">
            <div className="w-full">{children}</div>
          </section>
        </div>
      </WavyBackground>
    </main>
  );
};

export default RootLayout;
