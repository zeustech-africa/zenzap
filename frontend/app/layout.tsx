import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SupportWidget from "./components/SupportWidget";
import { RouterProvider } from "./components/RouterProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZENZAP - WhatsApp Business Automation",
  description: "Turn WhatsApp into your business superpower. Automate customer conversations, boost sales, and never miss a message.",
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
      <body className="min-h-full">
        <RouterProvider>
          {children}
          <SupportWidget />
        </RouterProvider>
      </body>
    </html>
  );
}