import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "./components/Navbar";
import "./styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ashtiany Fit",
  description: "Enter the dungeon and unlock your potential.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`bg-gradient-to-b from-black via-gray-900 to-gray-950 text-gray-200 ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Navbar />
        <main className="px-4 sm:px-6 lg:px-8 pt-4 pb-20 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
