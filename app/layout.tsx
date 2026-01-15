import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Habit & Project Tracker',
  description: 'Track your habits, projects, and goals with beautiful stats and graphs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
