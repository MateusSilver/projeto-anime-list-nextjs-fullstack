/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://projeto-anime-list-six.vercel.app";

  const staticRoutes = ["", "/users"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    const animesRes = await fetch(`${baseUrl}/api/animes`);
    const animes = await animesRes.json();

    const listaDeAnimes = Array.isArray(animes) ? animes : animes.content || [];

    // Adicione esta validação:
    if (!Array.isArray(listaDeAnimes)) {
      throw new Error("A API não retornou um array válido de animes.");
    }

    const usersRes = await fetch(`${baseUrl}/api/users`);
    const users = await usersRes.json();

    const animeRoutes = listaDeAnimes.map((anime: any) => ({
      url: `${baseUrl}/anime/${anime.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    const userRoutes = users.map((user: any) => ({
      url: `${baseUrl}/user/${user.id}/list`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...animeRoutes, ...userRoutes];
  } catch (error) {
    console.error("Erro ao gerar rotas dinâmicas do sitemap:", error);
    return staticRoutes;
  }
}
