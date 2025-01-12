"use client"
import { Geist, Geist_Mono } from "next/font/google";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "./components/header/header";
import ChatbotPopup from "./components/ChatbotPopup";
import { MetaMaskProvider } from "@/context/MetaMaskContext";
import Footer from "./components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display:'swap',
  fallback: ['Arial', 'sans-serif'],
});


export default function RootLayout({ children }) {
  return (
    <MetaMaskProvider>
      <html lang="en">
        <body
          className={`${montserrat} ${geistSans.variable} ${geistMono.variable} min-h-screen overflow-x-hidden relative antialiased dark`}
        >
          <Header />
          {children}
          <ChatbotPopup />
          <Footer />
        </body>
      </html>
    </MetaMaskProvider>
  );
}
