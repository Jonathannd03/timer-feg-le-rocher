import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FEG le Rocher | Gottesdienst Timer",
  description: "Gottesdienst Timer – FEG le Rocher",
  icons: {
    icon: "/images/feg_logo.png",
    apple: "/images/feg_logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
