import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://adventhopeacademy.com'),
  title: {
    default: "Advent Hope Academy - Premier Christian School in Zimbabwe | Cambridge & ZIMSEC",
    template: "%s | Advent Hope Academy"
  },
  description: "Official School Management System for Advent Hope Academy in Zimbabwe. Excellence in Christian education offering Cambridge and ZIMSEC curricula. Student registration, online portal, attendance tracking, and grades management.",
  keywords: [
    "Advent Hope Academy",
    "Zimbabwe school",
    "Christian school Zimbabwe",
    "school management system",
    "student portal",
    "Cambridge curriculum Zimbabwe",
    "ZIMSEC school",
    "private school Zimbabwe",
    "Harare school",
    "online student registration",
    "school fees payment",
    "parent portal"
  ],
  authors: [{ name: "Advent Hope Academy" }],
  creator: "Advent Hope Academy",
  publisher: "Advent Hope Academy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_ZW",
    url: "https://adventhopeacademy.com",
    title: "Advent Hope Academy - Premier Christian School in Zimbabwe",
    description: "Excellence in Christian education offering Cambridge and ZIMSEC curricula. Comprehensive school management system for students, parents, and staff.",
    siteName: "Advent Hope Academy",
    images: [
      {
        url: "/uploads/logo.png",
        width: 1200,
        height: 630,
        alt: "Advent Hope Academy Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Advent Hope Academy - Premier Christian School in Zimbabwe",
    description: "Excellence in Christian education offering Cambridge and ZIMSEC curricula. Student portal, online registration, and comprehensive school management.",
    images: ["/uploads/logo.png"],
    creator: "@adventhopeacademy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/uploads/logo.png',
    shortcut: '/uploads/logo.png',
    apple: '/uploads/logo.png',
  },
  verification: {
    google: 'your-google-verification-code-here', // Replace with actual code from Google Search Console
  },
  alternates: {
    canonical: 'https://adventhopeacademy.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

