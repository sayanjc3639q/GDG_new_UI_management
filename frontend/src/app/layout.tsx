import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/shared/context/theme-context';

export const metadata: Metadata = {
  title: 'GDG Operations & Management Platform',
  description: 'Enterprise operations dashboard for GDG chapters, calendar, task management, meetings, and leave approvals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
