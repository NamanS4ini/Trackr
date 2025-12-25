import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HabitProvider } from "@/components/habit-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trackr - Build Better Habits",
  description: "Priority-based habit tracker with visual analytics and smart insights. Transform your daily routine into consistent progress.",
  keywords: ["habit tracker", "productivity", "goal tracking", "habits", "daily tracker"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <HabitProvider>{children}</HabitProvider>
      </body>
    </html>
  );
}
