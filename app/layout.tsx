import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Montserrat } from "next/font/google";
import { Poppins } from "next/font/google";
import { Inter } from "next/font/google";
import Header from "@/components/Home/Header";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Money Wins - SInvestment(Smart Investment)",
  description: "Side project for gathering and sorting financial data for better investment decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${inter.variable} 
           font-[var(--font-inter)]  
          antialiased
          bg-neutral-950
        `}
      >
        <Toaster
          dir="rtl"
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "Kook",
              background: "var(--card)",
              color: "var(--card-foreground)",
              border: "1px solid var(--border)",
            },
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="font-inter !important">
            <Header />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
