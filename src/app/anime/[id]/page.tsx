import type { Metadata } from "next";
import AnimeClient from "./animeClient";
import { AnimeDetailsDTO } from "@/types/anime";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "Anime Details",
    description: "Visualize os detalhes, anotações e avaliações do seu anime.",
  };
}

export default async function AnimePage({ params }: Props) {
  const resolvedParams = await params;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  let initialData: AnimeDetailsDTO | null = null;

  try {
    const res = await fetch(`${apiUrl}/api/animes/${resolvedParams.id}`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      initialData = (await res.json()) as AnimeDetailsDTO;
    }
  } catch (error) {
    console.error("Fetch no servidor falhou (esperado sem token):", error);
  }

  return <AnimeClient params={resolvedParams} initialData={initialData} />;
}
