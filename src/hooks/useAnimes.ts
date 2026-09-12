import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { Anime } from "@/types/anime";
import { useDebounce } from "use-debounce";

interface AnimePageResponse {
  content: Anime[];
  last: boolean;
  number: number;
}

export function useAnimes() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("status");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterValue, setFilterValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const queryKey = [
    "animes",
    debouncedSearchQuery,
    filterCategory,
    filterValue,
    sortBy,
    showFavoritesOnly,
  ];

  const fetchAnimes = async ({ pageParam = 0 }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      throw new Error("Sem token");
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    let url = `${apiUrl}/api/animes?page=${pageParam}&size=20`;

    if (debouncedSearchQuery)
      url += `&search=${encodeURIComponent(debouncedSearchQuery)}`;
    if (filterCategory === "status" && filterValue)
      url += `&status=${filterValue}`;
    if (filterCategory === "type" && filterValue) url += `&type=${filterValue}`;
    if (showFavoritesOnly) url += `&favorite=true`;

    if (sortBy === "name") url += `&sort=title,asc`;
    else if (sortBy === "scoreDesc") url += `&sort=score,desc`;
    else if (sortBy === "scoreAsc") url += `&sort=score,asc`;
    else if (sortBy === "status")
      url += `&sort=statusWeight,asc&sort=score,desc`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      router.push("/login");
      throw new Error("Não autorizado");
    }

    if (!res.ok) throw new Error("Falha no servidor");

    return res.json();
  };

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: queryKey,
      queryFn: fetchAnimes,
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        return lastPage.last ? undefined : lastPage.number + 1;
      },
    });

  const animes = data?.pages.flatMap((page) => page.content) || [];

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/animes/${id}/favorite`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao favoritar");
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData<InfiniteData<AnimePageResponse>>(
        queryKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((anime) =>
                anime.id === id
                  ? { ...anime, favorite: !anime.favorite }
                  : anime,
              ),
            })),
          };
        },
      );
      return { previousData };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
      alert(`Falha ao atualizar favorito.`);
    },
  });

  const updateEpisodeMutation = useMutation({
    mutationFn: async ({
      id,
      animeAtualizado,
    }: {
      id: number;
      animeAtualizado: Anime;
    }) => {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/animes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(animeAtualizado),
      });
      if (!res.ok) throw new Error("Erro ao atualizar episódios");
    },
    onMutate: async ({ id, animeAtualizado }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData<InfiniteData<AnimePageResponse>>(
        queryKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((anime) =>
                anime.id === id ? animeAtualizado : anime,
              ),
            })),
          };
        },
      );
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
      alert("Ocorreu um erro ao atualizar o anime.");
    },
  });

  const saveAnimeMutation = useMutation({
    mutationFn: async (anime: Anime) => {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...dadosParaSalvar } = anime;
      const response = await fetch(`${apiUrl}/api/animes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dadosParaSalvar),
      });
      if (response.status === 409) throw new Error("Anime já existe na lista.");
      if (!response.ok) throw new Error("Erro ao salvar anime");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setIsPopupOpen(false);
    },
    onError: (error) => {
      alert(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao salvar o anime.",
      );
    },
  });

  // --- FUNÇÕES EXPORTADAS ---
  const handleToggleFavorite = (id: number) => {
    toggleFavoriteMutation.mutate(id);
  };

  const handleUpdateAnimeEpisodes = (id: number) => {
    const animeAtual = animes.find((a) => a.id === id);
    if (!animeAtual) return;
    if (
      animeAtual.episodes &&
      animeAtual.watchedEpisodes >= animeAtual.episodes
    )
      return;

    const updatedEpisodes = animeAtual.watchedEpisodes + 1;
    let novoStatus = animeAtual.status;

    if (animeAtual.episodes && animeAtual.episodes === updatedEpisodes) {
      window.alert(
        `Parabéns! O status de ${animeAtual.title} foi atualizado para 'Concluído'`,
      );
      novoStatus = "Completed";
    } else if (animeAtual.status !== "Watching") {
      novoStatus = "Watching";
    }

    updateEpisodeMutation.mutate({
      id,
      animeAtualizado: {
        ...animeAtual,
        watchedEpisodes: updatedEpisodes,
        status: novoStatus,
      },
    });
  };

  const handleSaveAnime = (anime: Anime) => {
    saveAnimeMutation.mutate(anime);
  };

  const handleFilterCategoryChange = (category: string) => {
    setFilterCategory(category);
    setFilterValue("");
  };

  return {
    animes,
    isLoading,
    isPopupOpen,
    setIsPopupOpen,
    filterCategory,
    filterValue,
    setFilterValue,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    showFavoritesOnly,
    setShowFavoritesOnly,
    handleFilterCategoryChange,
    handleToggleFavorite,
    handleUpdateAnimeEpisodes,
    handleSaveAnime,
    // O TanStack substitui o antigo estado manual
    hasMore: hasNextPage || false,
    isLoadingMore: isFetchingNextPage,
    handleLoadMore: () => fetchNextPage(),
  };
}
