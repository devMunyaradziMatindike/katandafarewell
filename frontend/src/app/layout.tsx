import type { Metadata } from "next";
import { Caveat, Lexend, Plus_Jakarta_Sans, Sue_Ellen_Francisco } from "next/font/google";
import "./globals.css";

/** Melun High–style: high x-height geometric sans for headlines */
const display = Lexend({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

/** Melun / GoFundMe Sans–style: warm geometric sans for body UI */
const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const script = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const motto = Sue_Ellen_Francisco({
  variable: "--font-motto",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Farewell Tribute for Mr Thompson Katanda",
  description:
    "Help honour Mr Thompson Katanda after 27 years of leadership at his farewell on 22 November 2026.",
  icons: {
    icon: "/images/logomhsss.png",
    apple: "/images/logomhsss.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable} ${script.variable} ${motto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
