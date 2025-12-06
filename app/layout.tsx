import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reframe | Visual Intelligence Platform",
  description: "Transform images into editable scene blueprints. Modify visual attributes and generate AI image prompts.",
  keywords: ["AI", "image analysis", "scene editor", "image generation", "Midjourney", "DALL-E", "prompt generator"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} antialiased bg-cinematic bg-grid min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
