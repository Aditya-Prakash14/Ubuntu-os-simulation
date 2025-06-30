import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ubuntu OS Simulator',
  description: 'Created by Next.js',
  
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
