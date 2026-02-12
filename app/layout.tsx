import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/providers/AuthProvider"; // ⭐ Import

export const metadata: Metadata = {
  title: "Jayabima POS",
  description: "Point of Sale Management System",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* ⭐ Wrap children with AuthProvider */}
          <AuthProvider>{children}</AuthProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
