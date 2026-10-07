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
      <body className="antialiased">{children}</body>
    </html>
  );
}
