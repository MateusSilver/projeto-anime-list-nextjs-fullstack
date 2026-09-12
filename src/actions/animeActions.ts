"use server";

import { db } from "@/db";
import { animes } from "@/db/schema";
import { Anime } from "@/types/anime";
import { and, eq, ilike } from "drizzle-orm";
import { getSessionUser } from "@/actions/authActions";

export async function getAnimesAction({
  page = 0,
  search = "",
  status = "",
  type = "",
  favorite = false,
}) {
  const session = await getSessionUser();
  if (!session) throw new Error("Usuário não autenticado");

  const pageSize = 20;
  const filters = [];

  filters.push(eq(animes.userId, session.userId));
  if (search) filters.push(ilike(animes.title, `%${search}%`));
  if (status) filters.push(eq(animes.status, status));
  if (type) filters.push(eq(animes.type, type));
  if (favorite) filters.push(eq(animes.isFavorite, true));

  const data = await db
    .select()
    .from(animes)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .limit(pageSize + 1)
    .offset(page * pageSize);

  const hasMore = data.length > pageSize;
  const rawContent = hasMore ? data.slice(0, pageSize) : data;

  const content = rawContent.map((item) => ({
    ...item,
    favorite: item.isFavorite || false,
  }));

  return {
    content: content as unknown as Anime[],
    last: !hasMore,
    number: page,
  };
}

export async function saveAnimeAction(animeData: Anime) {
  const session = await getSessionUser();
  if (!session) throw new Error("Usuário não autenticado");

  if (!animeData.malId) {
    throw new Error("Anime malId é requesito.");
  }

  const existence = await db
    .select()
    .from(animes)
    .where(eq(animes.malId, animeData.malId))
    .limit(1);
  if (existence.length > 0) {
    throw new Error("Anime já existe na lista.");
  }

  const [novoAnime] = await db
    .insert(animes)
    .values({
      userId: session.userId,
      malId: animeData.malId,
      title: animeData.title || "",
      type: animeData.type || "TV",
      status: animeData.status || "Plan to Watch",
      score: String(animeData.score || "0"),
      episodes: animeData.episodes ?? 0,
      watchedEpisodes: animeData.watchedEpisodes || 0,
      imageUrl: animeData.imageUrl || "",
      isFavorite: animeData.favorite || false,
    })
    .returning();

  return { ...novoAnime, favorite: animeData.favorite };
}

export async function toggleFavoriteAction(id: number, newStatus: boolean) {
  const session = await getSessionUser();
  if (!session) throw new Error("Usuário não autenticado");

  await db
    .update(animes)
    .set({ isFavorite: newStatus })
    .where(eq(animes.id, id));
}

export async function updateAnimeEpisodesAction(
  id: number,
  watchedEpisodes: number,
  status: string,
) {
  const session = await getSessionUser();
  if (!session) throw new Error("Usuário não autenticado");

  await db
    .update(animes)
    .set({ watchedEpisodes, status })
    .where(eq(animes.id, id));
}
