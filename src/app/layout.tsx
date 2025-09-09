import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RLS Guard Dog - Row Level Security Demo',
  description: 'A comprehensive demonstration of Row Level Security (RLS) implementation with Supabase, showcasing secure data access patterns for educational platforms.',
  keywords: 'RLS, Row Level Security, Supabase, PostgreSQL, Security, Education, Demo',
  authors: [{ name: 'RLS Guard Dog Team' }],
  creator: 'RLS Guard Dog Team',
  publisher: 'RLS Guard Dog',
  robots: 'index, follow',
  openGraph: {
    title: 'RLS Guard Dog - Row Level Security Demo',
    description: 'Experience secure data access with Row Level Security policies in action',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RLS Guard Dog - Row Level Security Demo',
    description: 'Experience secure data access with Row Level Security policies in action',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <div id="root" className="min-h-full">
          {children}
        </div>
      </body>
    </html>
  )
}