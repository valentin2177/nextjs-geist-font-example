import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "Pokédex - Pokemon Browser",
  description: "A beautiful Pokedex with filters and bilingual support (German/English)",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className="dark">
      <body className="font-sans antialiased">
        <Providers>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
