import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ByteFootprint | Dashboard",
  description: "Enterprise Digital Carbon Footprint Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full min-w-full flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border-subtle bg-black/40 backdrop-blur-sm hidden md:flex flex-col">
          <div className="p-6 border-b border-border-subtle">
            <h1 className="text-xl font-bold bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
              ByteFootprint
            </h1>
            <p className="text-xs text-slate-400 mt-1">Enterprise Dashboard</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <a href="#" className="block px-4 py-2 bg-brand-900/40 text-brand-100 rounded-md border border-brand-500/20 font-medium">Overview</a>
            <a href="#" className="block px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-md transition-colors">Departments</a>
            <a href="#" className="block px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-md transition-colors">Users</a>
            <a href="#" className="block px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-md transition-colors">Reports</a>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-950/40 via-background to-background">
          {children}
        </main>
      </body>
    </html>
  );
}
