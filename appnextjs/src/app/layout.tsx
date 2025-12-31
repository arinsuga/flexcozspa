import type { Metadata, Viewport } from "next";
import "./globals.css";
import 'material-icons/iconfont/material-icons.css';
import Providers from "@/components/providers/Providers";
import UpdateNotification from "@/components/common/UpdateNotification";

export const metadata: Metadata = {
  title: "Flexcoz",
  description: "Flexible solution for contract and order management",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#5A9CB5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-montserrat text-gray-900 bg-background dark:text-gray-100 dark:bg-gray-900">
        <Providers>
            {children}
            <UpdateNotification />
        </Providers>
      </body>
    </html>
  );
}
