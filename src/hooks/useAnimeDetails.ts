import { useState, useEffect } from "react";
import { AnimeDetailsDTO, Anime } from "@/types/anime";
import { useRouter } from "next/navigation";
import {
  updateAnimeAction,
  saveReviewAction,
  getCommunityReviewsAction,
  likeReviewAction,
} from "@/actions/animeActions";

type ReviewItem = {
  reviewId: number;
  userId: number | null; // O leftJoin do Drizzle exige que isso possa ser null
  userName: string | null;
  userImage: string | null;
  text: string | null;
  likes: number | null;
  isLikedByMe?: boolean;
};

export function useAnimeDetails(
  animeId: string | string[],
  initialData?: AnimeDetailsDTO | null,
) {
  const router = useRouter();

  const [data, setData] = useState<AnimeDetailsDTO | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Anime & { tags: string[] }>>(
    {},
  );
  const [tagsInput, setTagsInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const getHighResImageUrl = (url?: string) => {
    if (!url) return "https://placehold.co/400x600/EDF2F7/718096?text=Sem+Capa";
    if (!url.includes("myanimelist.net")) return url;
    if (url.match(/l\.(jpg|webp|png|jpeg)$/i)) return url;
    if (url.match(/t\.(jpg|webp|png|jpeg)$/i)) {
      return url.replace(/t\.(jpg|webp|png|jpeg)$/i, "l.$1");
    }
    return url.replace(/\.(jpg|webp|png|jpeg)$/i, "l.$1");
  };

  const fetchReviews = async (malIdToSearch: number) => {
    try {
      const result = await getCommunityReviewsAction(malIdToSearch);
      setReviews(result as ReviewItem[]);
    } catch (error) {
      console.error("Erro ao buscar resenhas", error);
    }
  };

  useEffect(() => {
    if (data?.anime?.malId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchReviews(data.anime.malId);
      setIsLoading(false);
    } else if (!data) {
      setError("Não foi possível carregar os detalhes.");
      setIsLoading(false);
    }
  }, [data?.anime?.malId]);

  const handleOpenEdit = () => {
    if (data?.anime) {
      setEditForm(data.anime);
      setTagsInput(data.anime.tags ? data.anime.tags.join(", ") : "");
      setIsModalOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!data?.anime) return;

    setIsSaving(true);
    try {
      const updateTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== "");
      const payload = { ...editForm, tags: updateTags };

      const updatedAnime = await updateAnimeAction(Number(animeId), payload);

      setData((prev) =>
        prev ? { ...prev, anime: updatedAnime as unknown as Anime } : prev,
      );
      sessionStorage.removeItem("meusAnimesCache");
      setIsModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao salvar as alterações.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const fetchJikanData = async () => {
    if (!editForm?.malId) {
      alert("Por favor insira um ID disponível no My anime list");
      return;
    }
    setIsFetching(true);
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime/${editForm.malId}`,
      );
      if (!response.ok)
        throw new Error("Não foi possível buscar os dados do Jikan.");

      const jikanData = await response.json();
      const animeOficial = jikanData.data;

      setEditForm((prev) => ({
        ...prev,
        episodes: prev?.episodes || animeOficial.episodes || 0,
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao buscar dados do Jikan.",
      );
    } finally {
      setIsFetching(false);
    }
  };

  const handleLikeReview = async (reviewId: number) => {
    try {
      const novoTotalDeLikes = await likeReviewAction(reviewId);

      setReviews((prev) =>
        prev.map((rev) =>
          rev.reviewId === reviewId
            ? { ...rev, likes: novoTotalDeLikes, isLikedByMe: !rev.isLikedByMe }
            : rev,
        ),
      );
    } catch (error) {
      console.error("Erro ao curtir a resenha:", error);
    }
  };

  const handleSaveReview = async (newReviewText: string) => {
    if (!data?.anime) return;

    try {
      await saveReviewAction(Number(animeId), newReviewText);

      setData({ ...data, anime: { ...data.anime, reviewText: newReviewText } });

      if (data.anime.malId) {
        fetchReviews(data.anime.malId);
      }
    } catch (error) {
      alert("Não foi possível salvar a sua resenha.");
      console.error(error);
    }
  };

  return {
    data,
    isLoading,
    error,
    reviews,
    isReviewModalOpen,
    setIsReviewModalOpen,
    isModalOpen,
    setIsModalOpen,
    isImageModalOpen,
    setIsImageModalOpen,
    editForm,
    setEditForm,
    tagsInput,
    setTagsInput,
    isSaving,
    isFetching,
    getHighResImageUrl,
    handleOpenEdit,
    handleSaveEdit,
    fetchJikanData,
    handleLikeReview,
    handleSaveReview,
  };
}
