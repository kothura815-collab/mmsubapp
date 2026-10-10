import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "MM Sub App",
  description: "High Performance Next.js Community App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* HilltopAds Meta Tag Verification */}
        <meta name="hilltopads-site-verification" content="8f253bb9b8bac" />

        {/* Step 1: Adcash Library Script */}
        <Script
          id="aclib"
          src="//acscdn.com/script/aclib.js"
          strategy="beforeInteractive"
        />

        {/* Step 2: Adcash AutoTag Runner Script */}
        <Script id="accash-autotag" strategy="afterInteractive">
          {`
            if (typeof aclib !== 'undefined') {
              aclib.runAutoTag({
                zoneId: 'zwldyojie4',
              });
            }
          `}
        </Script>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#fdfbf7" }}>
        {children}
      </body>
    </html>
  );
}
