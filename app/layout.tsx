import type { Metadata } from "next";
import { Be_Vietnam_Pro, Fraunces } from "next/font/google";
import "./globals.css";
import AppFrame from "@/components/AppFrame";
import { getSiteUrl } from "@/lib/seo";
import hotdealsIcon from "./hotdeals.jpg";

const bodyFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const headingFont = Fraunces({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "TapHoaDeal",
    template: "%s | TapHoaDeal",
  },
  description:
    "Review đồ cho phòng trọ, góc học tập, phụ kiện bàn học và đồ gia dụng nhỏ gọn.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "TapHoaDeal",
    description:
      "Review đồ cho phòng trọ, góc học tập, phụ kiện bàn học và đồ gia dụng nhỏ gọn.",
    url: getSiteUrl(),
    siteName: "TapHoaDeal",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TapHoaDeal",
    description:
      "Review đồ cho phòng trọ, góc học tập, phụ kiện bàn học và đồ gia dụng nhỏ gọn.",
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: hotdealsIcon.src, type: "image/jpeg" }],
    shortcut: [{ url: hotdealsIcon.src, type: "image/jpeg" }],
    apple: [{ url: hotdealsIcon.src, type: "image/jpeg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${bodyFont.variable} ${headingFont.variable}`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9948916314422728"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-[var(--bg)] text-[var(--ink)] antialiased">
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
