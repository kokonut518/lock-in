import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Study Noise Guard",
  description: "Detects room noise and tells people to be quiet 😡",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
