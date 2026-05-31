import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
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
        <main className="ml-60 min-h-full">
          <div className="p-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
