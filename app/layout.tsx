import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { CommandPalette } from "@/components/command-palette";
import { seedDatabase } from "@/lib/actions";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pocketlog",
  description: "Personal finance tracker",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await seedDatabase();

  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-slate-50 antialiased">
        <Sidebar />
        <CommandPalette />
        <main className="md:ml-60 min-h-full pt-14 md:pt-0 pb-16 md:pb-0">
          <div className="p-4 md:p-8">{children}</div>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
