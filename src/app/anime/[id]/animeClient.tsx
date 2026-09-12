"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useAnimeDetails } from "@/hooks/useAnimeDetails";
import { AnimeDetailsDTO } from "@/types/anime";
import { useEffect } from "react";
import AnimeDetailsSection from "@/components/AnimeDetailsSection";
import CommunityReviewsSection from "@/components/CommunityReviewsSection";
import BackButton from "@/components/BackButton";
import Image from "next/image";
import dynamic from "next/dynamic";

const ReviewModal = dynamic(() => import("@/components/ReviewModal"), {
  ssr: false,
  loading: () => <p className="text-center text-muted">Carregando...</p>,
});

const EditAnimeModal = dynamic(() => import("@/components/EditAnimeModal"), {
  ssr: false,
  loading: () => <p className="text-center text-muted">Carregando...</p>,
});

function AnimeDetailsSkeleton() {
  return (
    <div className="container pt-5 mt-5">
      <div className="row g-5 placeholder-glow">
        {/* Esqueleto da Coluna Esquerda (Imagem) */}
        <div className="col-12 col-md-4">
          <div
            className="placeholder bg-secondary w-100 rounded-3 mb-3"
            style={{ height: "450px" }}
          ></div>
          <div
            className="placeholder bg-secondary w-100 rounded-3"
            style={{ height: "100px" }}
          ></div>
        </div>

        {/* Esqueleto da Coluna Direita (Textos) */}
        <div className="col-12 col-md-8">
          <h1 className="placeholder bg-secondary col-8 mb-4 rounded"></h1>
          <div className="d-flex gap-2 mb-4">
            <span className="placeholder bg-secondary col-2 p-3 rounded"></span>
            <span className="placeholder bg-secondary col-2 p-3 rounded"></span>
            <span className="placeholder bg-secondary col-3 p-3 rounded"></span>
          </div>
          <div
            className="placeholder bg-secondary w-100 rounded-3 mb-4"
            style={{ height: "100px" }}
          ></div>
          <div
            className="placeholder bg-secondary w-100 rounded-3"
            style={{ height: "150px" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

type Props = {
  params: { id: string };
  initialData?: AnimeDetailsDTO | null; // data preloaded
};

export default function AnimeDetailsPage({ params, initialData }: Props) {
  const animeId = (params.id as string) || "";

  const {
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
  } = useAnimeDetails(animeId, initialData);

  useEffect(() => {
    if (data?.anime?.title) {
      document.title = `${data.anime.title} | Anime List`;
    }
  }, [data?.anime?.title]);

  if (isLoading) {
    return <AnimeDetailsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">
          {error || "Anime não encontrado."}
        </div>
        <Link href="/" className="btn btn-primary">
          Voltar para o Acervo
        </Link>
      </div>
    );
  }

  const { anime, globalUserCount, globalAverageScore } = data;

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* BACKGROUND DEGRADÊ OTIMIZADO */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "70vh",
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
        }}
      >
        <Image
          src={anime.imageUrl || "https://placehold.co/300x400/png"}
          alt="Background"
          fill
          quality={50} // Qualidade super baixa, pois o blur esconde os defeitos (economiza muita internet)
          priority // Baixa imediatamente junto com a página
          style={{
            objectFit: "cover",
            filter: "blur(6px)",
            opacity: 0.4,
            transform: "scale(1.1)", // O scale evita que o blur crie bordas brancas nas laterais
          }}
        />
      </div>

      <main
        className="container pt-5 pt-md-5"
        style={{ position: "relative", zIndex: 1, paddingTop: "120px" }}
      >
        {/* CABEÇALHO */}
        <BackButton href="/" />

        {/* 1. SEÇÃO DE DETALHES */}
        <AnimeDetailsSection
          anime={anime}
          globalUserCount={globalUserCount}
          globalAverageScore={globalAverageScore}
          getHighResImageUrl={getHighResImageUrl}
          onOpenImageModal={() => setIsImageModalOpen(true)}
          onOpenEdit={handleOpenEdit}
        />

        {/* 2. SEÇÃO DE RESENHAS GLOBAIS */}
        <CommunityReviewsSection
          reviews={reviews}
          animeId={animeId}
          onOpenReviewModal={() => setIsReviewModalOpen(true)}
          onLikeReview={handleLikeReview}
        />

        {/* 3. MODAIS */}
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          initialText={anime.reviewText || ""}
          animeTitle={anime.title || "este anime"}
          onSave={handleSaveReview}
        />

        <EditAnimeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editForm={editForm}
          setEditForm={setEditForm}
          tagsInput={tagsInput}
          setTagsInput={setTagsInput}
          isSaving={isSaving}
          isFetching={isFetching}
          onSave={handleSaveEdit}
          onFetchJikan={fetchJikanData}
        />

        {/* O Modal de Imagem é tão simples que não precisa de um ficheiro extra */}
        {isImageModalOpen && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{
              backgroundColor: "rgba(0,0,0,0.9)",
              zIndex: 1050,
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setIsImageModalOpen(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: "90vw", height: "90vh", margin: "auto" }}
            >
              <div className="modal-content bg-transparent border-0 shadow-none w-100 h-100">
                <div
                  className="modal-header border-0 pb-0 justify-content-end position-absolute top-0 end-0 bg-body-transparent text-body"
                  style={{ zIndex: 1 }}
                >
                  <button
                    type="button"
                    className="btn text-white p-3 rounded-circle"
                    onClick={() => setIsImageModalOpen(false)}
                    title="Fechar"
                  >
                    <X fill="currentColor" size={22} />
                  </button>
                </div>
                <div className="modal-body text-center p-0 d-flex justify-content-center align-items-center h-100">
                  <div
                    style={{
                      position: "relative",
                      height: "70vh",
                      width: "100%",
                    }}
                  >
                    <Image
                      src={getHighResImageUrl(anime.imageUrl)}
                      alt={anime.title}
                      className="img-fluid rounded-none shadow-lg"
                      fill
                      sizes="100vw"
                      quality={100}
                      style={{
                        objectFit: "contain",
                        cursor: "zoom-out",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsImageModalOpen(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
