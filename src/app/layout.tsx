import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Recruit | Candidate Analysis',
  description: 'Internal recruiting tool for candidate screening and outreach',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-50 font-sans text-surface-900 antialiased">
        {children}
      </body>
    </html>
  );
}
