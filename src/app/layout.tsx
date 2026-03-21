import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clonar Virales - Replica Videos Virales de TikTok Shop",
  description:
    "Analiza y replica videos virales de TikTok Shop con IA. Genera videos con la misma estructura, guion y estilo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-950 text-white">
        {children}
      </body>
    </html>
  );
}
