import './globals.css'
import { Raleway } from 'next/font/google'

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-raleway',
})

export const metadata = {
  metadataBase: new URL('https://inspelink.com'),
  title: 'INSPELINK — Marine Cargo Survey Platform',
  description: 'Find a certified marine cargo surveyor at any port, any time. INSPELINK connects insurers and P&I correspondents with independent certified surveyors in 60+ countries.',
  openGraph: {
    title: 'INSPELINK — Marine Cargo Survey Platform',
    description: 'Find a certified marine cargo surveyor at any port, any time. 60+ countries. Under 4 hours. No subscription.',
    url: 'https://inspelink.com',
    siteName: 'INSPELINK',
    images: [
      {
        url: 'https://bcjnbmqrtdibhqtrjaye.supabase.co/storage/v1/object/public/public-assets/Hero.jpeg',
        width: 1200,
        height: 630,
        alt: 'INSPELINK — Marine Cargo Survey Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'INSPELINK — Marine Cargo Survey Platform',
    description: 'Find a certified marine cargo surveyor at any port, any time.',
    images: ['https://bcjnbmqrtdibhqtrjaye.supabase.co/storage/v1/object/public/public-assets/Hero.jpeg'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={raleway.variable}>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
