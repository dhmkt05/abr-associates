import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ABR Associates Admin",
  description: "Internal business management system for ABR Associates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[var(--color-page)] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
