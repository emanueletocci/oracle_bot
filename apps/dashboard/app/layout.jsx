import './globals.css'

const siteUrl = 'https://tuodominio.com' // ← dominio reale

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Oracle — One Bot. Endless Chaos.',
    template: '%s | Oracle',
  },
  description:
    'Oracle is the free, open-source all-in-one Discord bot: moderation, music, games and more. Add it to your server in one click.',
  applicationName: 'Oracle',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Oracle',
    title: 'Oracle — One Bot. Endless Chaos.',
    description: 'The free, open-source all-in-one Discord bot.',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png', // 1200×630, in /public
        width: 1200,
        height: 630,
        alt: 'Oracle Discord bot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oracle — One Bot. Endless Chaos.',
    description: 'The free, open-source all-in-one Discord bot.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0a', // colore di sfondo del sito / del brand
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}