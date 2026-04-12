import type { Metadata } from "next";
import { Be_Vietnam_Pro, Fraunces } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  metadataBase: new URL("https://your-domain.com"),
  title: {
    default: "Góc Trọ Tối Ưu",
    template: "%s | Góc Trọ Tối Ưu",
  },
  description:
    "Review đồ cho phòng trọ, góc học tập, phụ kiện bàn học và đồ gia dụng nhỏ gọn.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Góc Trọ Tối Ưu",
    description:
      "Review đồ cho phòng trọ, góc học tập, phụ kiện bàn học và đồ gia dụng nhỏ gọn.",
    url: "https://your-domain.com",
    siteName: "Góc Trọ Tối Ưu",
    locale: "vi_VN",
    type: "website",
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
      <body className="bg-[var(--bg)] text-[var(--ink)] antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
