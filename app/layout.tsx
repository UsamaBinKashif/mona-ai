/* eslint-disable camelcase */
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from "next";
import { ReactNode } from "react";

import { Toaster } from "@/components/ui/toaster";
import { SocketProvider } from "@/providers/SocketProvider";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";



export const metadata: Metadata = {
  title: "MONA AI",
  description: "Video calling App",
  icons: {
    icon: "/icons/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <ClerkProvider
        appearance={{
          layout: {
            socialButtonsVariant: "iconButton",
          },
          variables: {
            colorText: "#fff",
            colorPrimary: "#0E78F9",
            colorBackground: "#1C1F2E",
            colorInputBackground: "#252A41",
            colorInputText: "#fff",
          },
        }}
      >

        <SocketProvider>
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
        </SocketProvider>
      </ClerkProvider>
    </html>
  );
}
