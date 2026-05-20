import type { Metadata } from "next";
import "./globals.css";
import MainHeader from "@/components/MainHeader";
import { AuthProvider } from "@/context/AuthContext";
export const metadata: Metadata = {
  title: "MedSearch",
  description: "Agendamento e gerenciamento online de consultas medicas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
    >

      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <MainHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
