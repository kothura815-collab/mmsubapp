import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MM Sub App",
  description: "Next.js & Supabase Web Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="8f253bb9b8bad810d8d87faeb5239216c4d5a182" content="8f253bb9b8bad810d8d87faeb5239216c4d5a182" />
      <body className="antialiased">{children}</body>
    </html>
  );
}
