import type { Metadata } from "next";
import "./globals.css";
import RootLayoutContent from "@/components/RootLayoutContent";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "Premium Finance Manager - AI Powered",
  description: "Manage your business finances with AI and 3D visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LanguageProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </LanguageProvider>
      </body>
    </html>
  );
}
