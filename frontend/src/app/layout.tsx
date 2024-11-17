import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Loading from '@/components/loading';
import React from 'react';

export const metadata: Metadata = {
  title: 'Chatcraze',
  description: 'A free open-source chatting application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased dark`}>
        <main>
          <React.Suspense fallback={<Loading />}>{children}</React.Suspense>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
