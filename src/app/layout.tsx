import "~/styles/globals.css";
import localFont from "next/font/local";
import { Inter, Libre_Baskerville } from "next/font/google";
import { GeistSans } from "geist/font/sans";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const neue = localFont({
  src: '../../fonts/Neue-Regrade-Variable.ttf',
  variable: '--neue'
});

export const metadata = {
  title: "Geodle",
  description: "Guess the city",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${neue.variable}`}>{children}</body>
    </html>
  );
}
