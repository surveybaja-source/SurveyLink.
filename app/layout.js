import { Raleway } from 'next/font/google'

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-raleway',
})

export const metadata = {
  title: 'INSPELINK — Marine Cargo Survey Platform',
  description: 'The first B2B marketplace connecting marine cargo insurers with certified surveyors worldwide.',
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
