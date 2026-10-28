import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist_Mono, Inter } from "next/font/google";
import { siteName, siteUrl } from "@/lib/site";
import "./globals.css";

// Кириллица нужна обоим: моно-капс в метках («[ПРИВЕТСТВИЕ]») тоже русский.
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s — ${siteName}` },
  description:
    "Welcome Book для новых сотрудников TRENDSETTER: культура, первый день, ресурсы и ответы на вопросы.",
  applicationName: siteName,
  // Внутренний документ для сотрудников: в поиск не отдаём.
  robots: { index: false, follow: false },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-white text-sage">{children}
        <Analytics />
      </body>
    </html>
  );
}
