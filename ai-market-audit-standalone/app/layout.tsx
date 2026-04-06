import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'AI Market Audit — Website Marketing & Conversion Analysis',
  description: 'AI-powered website marketing audit tool. Enter any URL to get instant scores, critical issues, SEO analysis, content strategy, and a downloadable report.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gradient-dark text-white antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
