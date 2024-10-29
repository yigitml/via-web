// app/layout.tsx
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "URL to Video with AI",
  description: "Convert any URL into an AI-generated video",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.className} bg-white dark:bg-black text-gray-900 dark:text-white min-h-screen`}>
        <Header />
        <div className="pt-20">
          {children}
        </div>
      </body>
    </html>
  )
}
