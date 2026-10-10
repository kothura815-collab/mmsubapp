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

        {/* --- Adcash Integration --- */}
        <Script
          id="aclib"
          src="//acscdn.com/script/aclib.js"
          strategy="beforeInteractive"
        />
        <Script id="adcash-autotag" strategy="afterInteractive">
          {`
            if (typeof aclib !== 'undefined') {
              aclib.runAutoTag({
                zoneId: 'zwldyojie4',
              });
            }
          `}
        </Script>

        {/* --- RichAds Popunder Script --- */}
        <Script
          src="https://richinfo.co/richpartners/pops/js/richads-pu-ob.js"
          data-pubid="1021768"
          data-siteid="409677"
          strategy="afterInteractive"
        />

        {/* --- RichAds In-Page Push Script (Updated to siteid=409679) --- */}
        <Script
          src="https://richinfo.co/richpartners/in-page/js/richads-ob.js?pubid=1021768&siteid=409679"
          strategy="afterInteractive"
        />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#fdfbf7" }}>
        {children}
      </body>
    </html>
  );
}
