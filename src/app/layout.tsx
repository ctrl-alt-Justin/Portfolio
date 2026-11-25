import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Justin A. Labrador — Full-Stack, Applied AI, Edge IoT/CAD & 3D",
  description:
    "Interactive engineering and 3D portfolio of Justin A. Labrador spanning commercial full-stack platforms, applied RAG AI tutoring, edge IoT/CAD hardware, and Unreal Engine 5 / Blender environments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-[#0E0E10] text-[#F4F4F6] font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
