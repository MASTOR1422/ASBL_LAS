import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "ASBL LAS — Les Amis de la Semence", description: "Plateforme associative des Amis de la Semence." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
