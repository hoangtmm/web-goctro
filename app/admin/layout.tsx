import type { Metadata } from "next";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";

export const metadata: Metadata = {
  title: "Quản trị nội dung",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
