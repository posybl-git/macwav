import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "macwav — Artist Development Portal",
  description:
    "macwav artist development and client portal. Track songs, manage credits, and grow your music career.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>

        <Script id="ybug-setup" strategy="afterInteractive">
          {`
            window.ybug_settings = {"id":"zzp9kayhcsjnfs874476"};
            (function() {
              var ybug = document.createElement('script'); ybug.type = 'text/javascript'; ybug.async = true;
              ybug.src = 'https://widget.ybug.io/button/' + window.ybug_settings.id + '.js';
              var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ybug, s);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
