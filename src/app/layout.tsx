import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";
import Navbar from "@/components/Navbar";
import QueryProvider from "@/providers/QueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://projeto-anime-list-3zwq324su.vercel.app"),
  title: {
    default: "Anime List dashboard : Seu Catálogo de Animes pessoal",
    template: "%s : Anime List",
  },
  description:
    "Gerencie seu catálogo de animes pessoal com facilidade, notas e comentários. Avalie e acompanhe seu progresso e métricas de visualização e compare com outros usuários.",
  keywords: [
    "animelist",
    "lista de animes",
    "catálogo de animes",
    "rastrear animes",
    "anime list",
    "dashboard de animes",
    "gerenciamento de animes",
    "notas de animes",
    "comentários de animes",
    "progresso de animes",
    "métricas de visualização de animes",
    "animes para ver",
  ],
  authors: [
    {
      name: "Mateus da Silveira Batista",
      url: "https://mateussilver.github.io/portifolio/",
    },
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Anime List : Seu Catálogo de Animes Pessoal",
    description:
      "Gerencie seu catálogo de animes pessoal com facilidade, notas e comentários. Avalie e acompanhe seu progresso e métricas de visualização e compare com outros usuários.",
    url: "/",
    siteName: "Anime List",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={`${inter.variable} ${poppins.variable}`}>
      <body
        className={`${inter.className} bg-body-secondary text-body-secondary`}
      >
        <QueryProvider>
          <Navbar />
          {children}
          <ThemeToggle />
        </QueryProvider>
      </body>
      {/* Tag do GA4 */}
      <GoogleAnalytics gaId="G-KL2XPW99E1" />
    </html>
  );
}
