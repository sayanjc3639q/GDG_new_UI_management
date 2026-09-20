import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/shared/context/theme-context';
import { AuthProvider } from '@/shared/context/auth-context';
import { ReduxProvider } from '@/store/provider';

export const metadata: Metadata = {
  title: 'GDG Management Platform',
  description: 'GDG Management Platform - Chapter Workspace',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Google+Sans+Text:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Roboto+Mono:wght@400;500&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body suppressHydrationWarning>
        <ReduxProvider>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
