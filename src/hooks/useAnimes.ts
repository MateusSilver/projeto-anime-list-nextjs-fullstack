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
import {
  getAnimesAction,
  saveAnimeAction,
  toggleFavoriteAction,
  updateAnimeEpisodesAction,
} from "@/actions/animeActions";

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
    const response = await getAnimesAction({
      page: pageParam,
      search: debouncedSearchQuery,
      status: filterCategory === "status" ? filterValue : "",
      type: filterCategory === "type" ? filterValue : "",
      favorite: showFavoritesOnly,
    });

    return response;
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

  const animes: Anime[] = (data?.pages.flatMap((page) => page.content) ||
    []) as Anime[];

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({
      id,
      newStatus,
    }: {
      id: number;
      newStatus: boolean;
    }) => {
      await toggleFavoriteAction(id, newStatus);
    },

    onMutate: async ({ id }) => {
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
    onError: (err, variables, context) => {
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
      await updateAnimeEpisodesAction(
        id,
        animeAtualizado.watchedEpisodes,
        animeAtualizado.status,
      );
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
      return await saveAnimeAction(anime);
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

  const handleToggleFavorite = (id: number) => {
    const anime = animes.find((a) => a.id === id);
    if (anime) {
      toggleFavoriteMutation.mutate({ id, newStatus: !anime.favorite });
    }
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
