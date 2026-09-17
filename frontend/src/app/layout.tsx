import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Paper2Project — Research to Implementation AI Platform",
  description:
    "Transform research papers and project ideas into real-world code, discover similar repositories, gap analysis, AI copilot, and dynamic implementation roadmaps.",
  icons: {
    icon: [
      { url: "/logo.png", href: "/logo.png" },
      { url: "/bg-logo.png", href: "/bg-logo.png" },
    ],
    shortcut: "/logo.png",
    apple: "/bg-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/bg-logo.png" />
      </head>
      <body className={`${inter.className} min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-indigo-500 selection:text-white`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
