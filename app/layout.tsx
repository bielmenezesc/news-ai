import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "News AI",
  description: "Desafio técnico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ Top Navigation */}
        <nav className="fixed top-0 w-full z-10 bg-white text-black px-6 py-3 flex items-center justify-between">
          <div className="font-bold text-lg">NewsAI</div>
          <div className="space-x-4">
            <Link href="/" className="hover:underline font-bold">
              Home
            </Link>
            <Link href="/results" className="hover:underline font-bold">
              Results
            </Link>
          </div>
        </nav>

        {/* ✅ Page Content */}
        <main className="max-w-5xl mx-auto pt-15">{children}</main>
      </body>
    </html>
  );
}
