import type { Metadata } from "next";
import localFont from "next/font/local";
import SessionAuthProvider from "@/context/SessionAuthProvider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Comercio 32 Mariano H cornejo",
  description: "Pagina web del comercio 32 Mariano H cornejo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionAuthProvider>{children}</SessionAuthProvider>
        
      </body>
    </html>
  );
}
