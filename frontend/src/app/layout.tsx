import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zeta Design",
  description: "Editor visual do Zeta Design",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
