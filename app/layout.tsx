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
      <head>
        <link rel="preload" as="image" href="/images/timer-bg.jpg" />
        <link rel="preload" as="image" href="/images/bible-bg.jpg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
