import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../shared/css/satoshi.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import Loader from "@/shared/common/Loader";
import MetaData from "@/shared/core/MetaData";
import WrapperLayouts from "@/shared/layouts/wrapper-layout";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});
export const viewport: Viewport = {
  themeColor: "#6160b0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};
export const metadata: Metadata = {
  ...MetaData("Cognitiveview AI Governance Platform"),
  manifest: "/manifest.json"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Suspense fallback={<Loader />}>
            <WrapperLayouts>{children}</WrapperLayouts>
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
