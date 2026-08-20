import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Token-Diet — Dynamic Context Compressor",
  description: "Strip filler from retrieved RAG chunks before they hit the LLM.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-base-950 font-sans text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
