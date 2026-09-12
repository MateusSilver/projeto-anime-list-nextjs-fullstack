"use client";

import AnimeControls from "@/components/AnimeControls";
import FilterSummary from "@/components/FilterSummary";
import AnimeGrid from "@/components/AnimeGrid";
import { useAnimes } from "@/hooks/useAnimes";
import { FILTER_OPTIONS } from "@/constants/animeConstants";
import dynamic from "next/dynamic";

const AddAnimeModal = dynamic(() => import("@/components/AddAnimeModal"), {
  ssr: false,
  loading: () => (
    <p className="text-center text-muted">Carregando formulário...</p>
  ),
});

export default function List() {
  // cerebro
  const {
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
    hasMore,
    isLoadingMore,
    handleLoadMore,
  } = useAnimes();

  return (
    <main className="container py-4 mt-4">
      <AnimeControls
        filterCategory={filterCategory}
        onFilterCategoryChange={handleFilterCategoryChange}
        filterValue={filterValue}
        onFilterValueChange={setFilterValue}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onOpenPopUp={() => setIsPopupOpen(true)}
        filterOptions={FILTER_OPTIONS}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
      />

      <FilterSummary
        filterCategory={filterCategory}
        filterValue={filterValue}
        totalFound={animes.length}
      />

      <AnimeGrid
        animes={animes}
        isLoading={isLoading}
        onIncrement={handleUpdateAnimeEpisodes}
        onToggleFavorite={handleToggleFavorite}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
      />

      <AddAnimeModal
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSave={handleSaveAnime}
        filterOptions={FILTER_OPTIONS}
      />
    </main>
  );
}
