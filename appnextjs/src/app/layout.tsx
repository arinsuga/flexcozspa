import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers/Providers";
import UpdateNotification from "@/components/common/UpdateNotification";

export const metadata: Metadata = {
  title: "Flexcoz",
  description: "Flexible solution for contract and order management",
  manifest: "/manifest.json",
  themeColor: "#5A9CB5",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-montserrat text-gray-900 bg-background dark:text-gray-100 dark:bg-gray-900">
        <Providers>
            {children}
            <UpdateNotification />
        </Providers>
      </body>
    </html>
  );
}
