import './globals.css'
import { Inter } from 'next/font/google'
import { getCldOgImageUrl } from 'next-cloudinary';
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'] })

import Nav from '@/components/Nav';
import Footer from '@/components/Footer'; 

export async function generateMetadata() {
  return {
    title: 'imgto.xyz - Optimize images without the loss of quality',
    description: 'Improve website performance for free by optimizing your JPG, PNG, WebP, and AVIF images using imgto.xyz.',
    openGraph: {
      images: [
        getCldOgImageUrl({
          src: 'assets/imgtoxyz-social-card_gxzddx'
        })
      ],
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="root">
          <Nav />
          <main>{children}</main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  )
}
