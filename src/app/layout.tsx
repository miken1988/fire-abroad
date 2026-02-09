import Script from 'next/script';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { defaultMetadata, generateStructuredData } from "@/lib/metadata";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = generateStructuredData();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        {/* Google Analytics 4 + Google Ads */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-584EMEC7MD"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-584EMEC7MD');
              gtag('config', 'AW-17937453268');
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('fire-abroad-theme');
                  // Default to dark mode unless explicitly set to light
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 py-6 px-4">
            <div className="max-w-4xl mx-auto text-center space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <strong>⚠️ Important Disclaimer:</strong> This tool is for educational and informational purposes only 
                and does NOT constitute financial, tax, legal, or immigration advice. All calculations are estimates 
                based on assumptions that may not reflect your actual situation. Tax laws, visa requirements, and 
                living costs change frequently. <strong>Always consult qualified professionals before making any 
                financial or relocation decisions.</strong> By using this site, you agree to our{' '}
                <a href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">Terms of Service</a>.
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                <span>© {new Date().getFullYear()} WhereToFIRE.com</span>
                <span>•</span>
                <a href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 hover:underline">Terms</a>
                <span>•</span>
                <a href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 hover:underline">Privacy</a>
              </div>
            </div>
          </footer>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
