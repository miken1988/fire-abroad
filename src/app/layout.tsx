import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { defaultMetadata, generateStructuredData } from "@/lib/metadata";
import { ThemeProvider } from "@/components/ThemeProvider";

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
            <div className="max-w-4xl mx-auto text-center space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <strong>Disclaimer:</strong> This tool is for educational and informational purposes only. 
                It does not constitute financial, tax, legal, or immigration advice. Tax laws and visa requirements 
                change frequently and vary by individual circumstances. Always consult qualified professionals 
                before making financial or relocation decisions.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                © {new Date().getFullYear()} WhereToFIRE.com • Built for the FIRE community
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
