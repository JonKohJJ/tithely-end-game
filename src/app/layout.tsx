import type { Metadata } from "next";
import "./globals.css";
import {
  ClerkProvider
} from '@clerk/nextjs'
import './App.css'
import { ThemeProvider } from "@/components/ThemeProvider";
import { Atkinson_Hyperlegible } from 'next/font/google'

const AtkinsonHyperlegibleFont = Atkinson_Hyperlegible({ 
  weight: ['400', '700'],
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: "Tithely End Game",
  description: "Authored by Jonathan Koh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`antialiased bg-color-bg ${AtkinsonHyperlegibleFont.className} fs-base`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="children-container">
              {children}
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
