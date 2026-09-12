"use client";
import { useState, useMemo, useEffect } from "react";
import { Loader2, SearchX } from "lucide-react";
import AnimeCard from "@/components/AnimeCard";
import AnimeControls from "@/components/AnimeControls";
import BackButton from "@/components/BackButton";
import EmptyState from "@/components/EmptySpace";
import { Anime } from "@/types/anime";
import {
  CATEGORY_LABELS,
  VALUE_LABELS,
  STATUS_WEIGHTS,
  BADGE_CLASSES,
  FILTER_OPTIONS,
} from "@/constants/animeConstants";

type Props = {
  params: { id: string };
};

export default function UserListClient({ params }: Props) {
  const [sortBy, setSortBy] = useState<string>("status");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterValue, setFilterValue] = useState<string>("");
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  const userId = params.id;

  useEffect(() => {
    const fetchAnimes = async () => {
      if (!userId) return;
      const token = localStorage.getItem("token");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      try {
        const res = await fetch(`${apiUrl}/api/users/${userId}/animes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setAnimes(data);
        } else {
          console.error("animes não recebidos: ", res.status);
        }
      } catch (error) {
        console.error("Erro ao carregar a lista pública:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnimes();
  }, [userId]);

  const handleFilterValueChange = (category: string) => {
    setFilterCategory(category);
    setFilterValue("");
  };

  const sortedAnimes = useMemo(() => {
    let animesCopy = [...animes];

    if (showFavoritesOnly) {
      animesCopy = animesCopy.filter((anime) => anime.favorite);
    }

    if (searchQuery.trim() !== "") {
      animesCopy = animesCopy.filter((anime) =>
        anime.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterCategory !== "all" && filterValue) {
      animesCopy = animesCopy.filter((anime) => {
        if (filterCategory === "status") return anime.status === filterValue;
        if (filterCategory === "type") return anime.type === filterValue;
        return true;
      });
    }

    return animesCopy.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "status":
          const pesoA = STATUS_WEIGHTS[a.status] || 999;
          const pesoB = STATUS_WEIGHTS[b.status] || 999;
          if (pesoA !== pesoB) return pesoA - pesoB;
          return (b.score || 0) - (a.score || 0);
        case "scoreDesc":
          return (b.score || 0) - (a.score || 0);
        case "scoreAsc":
          return (a.score || 0) - (b.score || 0);
        default:
          return 0;
      }
    });
  }, [
    animes,
    sortBy,
    filterCategory,
    filterValue,
    searchQuery,
    showFavoritesOnly,
  ]);

  if (isLoading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center mt-5 pt-5 text-body-secondary">
        <Loader2 size={48} className="icon-spin text-primary mb-3" />
        <h5 className="fw-semibold">Carregando acervo...</h5>
      </div>
    );
  }

  return (
    <main className="container py-5 mt-5">
      {/* 1. Botão de voltar padronizado à esquerda */}
      <div className="mb-4 text-start">
        <BackButton href={`/user/${userId}`} label="Voltar ao Perfil" />
      </div>

      {/* 2. Cabeçalho simplificado sem o botão de voltar no meio */}
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary-subtle pb-3">
        <div>
          <h1 className="fw-bold text-truncate mb-1">
            <span className="text-primary">Acervo Público</span>
          </h1>
          <p className="text-body-secondary m-0">Lista de Utilizador</p>
        </div>
      </div>

      <AnimeControls
        filterCategory={filterCategory}
        onFilterCategoryChange={handleFilterValueChange}
        filterValue={filterValue}
        onFilterValueChange={setFilterValue}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onOpenPopUp={() => void 0}
        filterOptions={FILTER_OPTIONS}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
        isReadOnly={true}
      />

      <div
        className="mb-4 d-flex justify-content-between align-items-end border-bottom pb-2 mt-4"
        style={{ borderColor: "var(--bs-card-border-color)" }}
      >
        <div>
          {filterCategory !== "all" && filterValue && (
            <p className="m-0 text-body-secondary fw-medium">
              Filtrando por: <span>{CATEGORY_LABELS[filterCategory]}</span> -{" "}
              <span className="text-primary">
                {VALUE_LABELS[filterValue] || filterValue}
              </span>
            </p>
          )}
        </div>
        {filterCategory !== "all" && (
          <p className="m-0 text-body-secondary fw-semibold">
            <span className="text-primary fs-5">{sortedAnimes.length}</span>{" "}
            Animes encontrados
          </p>
        )}
      </div>

      <div className="row g-3">
        {sortedAnimes.map((anime) => (
          <div key={anime.id} className="col-6 col-sm-4 col-md-3 col-lg-2 mb-4">
            <AnimeCard
              anime={anime}
              onIncrement={() => void 0}
              onToggleFavorite={() => void 0}
              valueLabels={VALUE_LABELS}
              badgeClasses={BADGE_CLASSES}
              isReadOnly={true}
            />
          </div>
        ))}

        {/* 3. Utilização do nosso EmptyState padronizado */}
        {sortedAnimes.length === 0 && (
          <div className="col-12 mt-4">
            <EmptyState
              icon={<SearchX size={48} />}
              title="Nenhum anime encontrado"
              description="Este utilizador não tem animes com os filtros e pesquisas atuais."
            />
          </div>
        )}
      </div>
    </main>
  );
}
