import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "同频 · 局域网聊天室",
  description: "简洁、实时的局域网聊天室。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
