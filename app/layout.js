// app/layout.js

import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script' // <-- 1. Importa il componente Script

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Movie Canon",
  description: "The Ultimate Movie Ranking by Marco Belemmi",
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>

      {/* --- 2. Aggiungi questo blocco per Google Analytics --- */}
      {process.env.NODE_ENV === 'production' && gaId && (
        <>
          <Script 
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} 
          />
          <Script 
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `,
            }}
          />
        </>
      )}
      {/* ---------------------------------------------------- */}
    </html>
  );
}