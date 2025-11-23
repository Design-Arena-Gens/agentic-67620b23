import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinWise AI - Smart Personal Finance Manager",
  description: "AI-powered expense tracking and financial management for everyone",
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
