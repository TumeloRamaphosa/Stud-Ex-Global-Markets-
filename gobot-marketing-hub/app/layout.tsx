import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'GoBot Marketing Content Hub',
  description: 'AI-powered multi-platform content automation with Blotato, n8n, and Airtable',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gradient-dark text-white antialiased min-h-screen">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid rgba(202,138,4,0.2)',
            },
          }}
        />
      </body>
    </html>
  );
}
