import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: "Health Tracking",
  description:
    "Track and manage your daily health metrics including sleep, medication, meals, and exercise. Perfect for maintaining a healthy lifestyle with diabetes.",
  generator: "Nagendra",
  authors: [{ name: "Nagendra" }],
  keywords: [
    "health tracking",
    "diabetes management",
    "medication tracking",
    "health metrics",
    "vitals monitoring",
  ],
  openGraph: {
    type: "website",
    title: "Health - Diabetic Control",
    description: "Track and manage your daily health metrics for better diabetic control",
    url: "https://srinivas-health.netlify.app/",
    siteName: "Health",
    images: [
      {
        url: "/health.png",
        width: 1200,
        height: 630,
        alt: "Health - Diabetic Control Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Health - Diabetic Control",
    description: "Track and manage your daily health metrics for better diabetic control",
    images: ["/health.png"],
    creator: "@nagendra1909",
  },
  icons: {
    icon: "/health.png",
    shortcut: "/health.png",
    apple: "/health.png",
  },
  manifest: "/manifest.json",
  metadataBase: new URL("https://srinivas-health.netlify.app/"),
};

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
