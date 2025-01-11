"use client"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header/header";
import ChatbotPopup from "./components/ChatbotPopup";
import { MetaMaskProvider } from "@/context/MetaMaskContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({ children }) {
  return (
    <MetaMaskProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-screen relative antialiased dark`}
        >
          <Header />
          {children}
          <ChatbotPopup />
        </body>
      </html>
    </MetaMaskProvider>
  );
}
