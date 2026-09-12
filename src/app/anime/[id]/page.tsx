import type { Metadata } from "next";
import AnimeClient from "./animeClient";
import { getAnimeByIdAction } from "@/actions/animeActions";

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
  const animeId = Number(resolvedParams.id);

  let initialData = null;

  try {
    const anime = await getAnimeByIdAction(animeId);

    if (anime) {
      initialData = {
        anime: anime,
        globalUserCount: 1, // Valores de placeholder (depois podemos fazer actions reais para eles)
        globalAverageScore: Number(anime.score) || 0,
      };
    }
  } catch (error) {
    console.error("Falha ao buscar anime via Server Action:", error);
  }

  return (
    <AnimeClient params={{ id: resolvedParams.id }} initialData={initialData} />
  );
}
