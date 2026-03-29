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
          <div className="p-6 border-b border-border-subtle flex flex-col items-center">
            <img src="/logo.png" alt="ByteZero Logo" className="w-32 h-auto drop-shadow-[0_0_10px_rgba(229,255,125,0.4)]" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-300/60 mt-4 font-bold">Enterprise Dashboard</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <a href="/" className="block px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-md transition-colors">Overview</a>
            <a href="/departments" className="block px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-md transition-colors">Departments</a>
            <a href="#" className="block px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-md transition-colors">Users</a>
            <a href="/reports" className="block px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-md transition-colors">Reports</a>
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
