import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { CommandPalette } from "@/components/command-palette";
import { AuthSessionProvider } from "@/components/layout/session-provider";
import { ServiceWorkerRegister } from "@/components/layout/sw-register";
import { seedDatabase } from "@/lib/actions";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pocketlog",
  description: "Personal finance tracker",
  manifest: "/manifest.webmanifest",
  applicationName: "Pocketlog",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Pocketlog" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Seed categories once (idempotent)
  if (session?.user) {
    await seedDatabase();
  }

  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-slate-50 antialiased">
        <ServiceWorkerRegister />
        <AuthSessionProvider>
          {session?.user && (
            <>
              <Sidebar user={{ name: session.user.name, email: session.user.email }} />
              <CommandPalette />
            </>
          )}
          <main className={`${session?.user ? "md:ml-60" : ""} min-h-full pt-14 md:pt-0 pb-20 md:pb-0`}>
            <div className="p-4 md:p-8 max-w-7xl">{children}</div>
          </main>
          <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
