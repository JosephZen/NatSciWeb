import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Picture Book of Wild Life and Plants | Campus Natural Science Catalog",
  description: "A full-stack interactive biodiversity field guide with 60 unique campus plants, insects, arachnids, and wildlife specimens, featuring an animated scrapbook experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Patrick+Hand&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
