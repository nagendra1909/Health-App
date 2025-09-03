import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Health Tracking',
  description: 'Track and manage your daily health metrics including sleep, medication, meals, and exercise. Perfect for maintaining a healthy lifestyle with diabetes.',
  generator: 'Nagendra',
  authors: [{ name: 'Nagendra' }],
  keywords: ['health tracking', 'diabetes management', 'medication tracking', 'health metrics', 'vitals monitoring'],
  openGraph: {
    type: 'website',
    title: 'VitalScore - Smart Health Tracking',
    description: 'Track and optimize your daily health metrics with VitalScore. Perfect for managing diabetes and maintaining a healthy lifestyle.',
    url: 'https://vitalscore.vercel.app',
    siteName: 'VitalScore',
    images: [
      {
        url: '/health.png',
        width: 1200,
        height: 630,
        alt: 'VitalScore - Health Tracking Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VitalScore - Smart Health Tracking',
    description: 'Track and optimize your daily health metrics with VitalScore. Perfect for managing diabetes and maintaining a healthy lifestyle.',
    images: ['/health.png'],
    creator: '@nagendra1909',
  },
  icons: {
    icon: '/health.png',
    shortcut: '/health-logo.png',
    apple: '/health.png',
  },
  manifest: '/manifest.json',
  metadataBase: new URL('https://vitalscore.vercel.app'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
