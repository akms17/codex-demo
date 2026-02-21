import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Dashboard',
  description: 'View historical stock prices and key metrics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
