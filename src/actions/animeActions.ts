"use server";

import { db } from "@/db";
import { animes } from "@/db/schema";
import { and, eq, ilike } from "drizzle-orm";

export async function getAnimesAction({
  page = 0,
  search = "",
  status = "",
  type = "",
  favorite = false,
}) {
  const pageSize = 20;

  const filters = [];

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
    content: content as any[],
    last: !hasMore,
    number: page,
  };
}

export async function saveAnimeAction(animeData: any) {
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
      malId: animeData.malId,
      title: animeData.title,
      type: animeData.type,
      status: animeData.status || "Plan to Watch",
      score: animeData.score || "0",
      episodes: animeData.episodes || 0,
      watchedEpisodes: animeData.watchedEpisodes || 0,
      imageUrl: animeData.imageUrl,
      isFavorite: animeData.isFavorite || false,
    })
    .returning();

  return { ...novoAnime, favorite: animeData.isFavorite };
}

export async function toggleFavoriteAction(id: number, newStatus: boolean) {
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
  await db
    .update(animes)
    .set({ watchedEpisodes, status })
    .where(eq(animes.id, id));
}
