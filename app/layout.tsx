import type { Metadata } from "next";
import { Bebas_Neue, Special_Elite, DM_Sans, Courier_Prime } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const elite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-elite",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmsans",
  display: "swap",
});

const courier = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-courier",
  display: "swap",
});

export const metadata: Metadata = {
  title: "COLD — Cases Only Lead Deeper",
  description:
    "A multiplayer investigation game. Receive real files. Work with your partner. Find the truth.",
  openGraph: {
    title: "COLD — Cases Only Lead Deeper",
    description:
      "A multiplayer investigation game. Receive real files. Work with your partner. Find the truth.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${elite.variable} ${dmSans.variable} ${courier.variable}`}
    >
      <body className="font-body bg-cold-bg text-cold-text grain vignette antialiased">
        {children}
      </body>
    </html>
  );
}
