import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studyspace · Library seats",
  description: "Live library seat availability dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
