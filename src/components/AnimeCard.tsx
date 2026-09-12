import { MessageSquare, Plus, Star } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Anime } from "@/types/anime";
import Image from "next/image";

export interface AnimeCardProps {
  anime: Anime;
  onIncrement: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  valueLabels: Record<string, string>;
  badgeClasses: Record<string, string>;
  isReadOnly?: boolean;
  priority?: boolean;
}

export default function AnimeCard({
  anime,
  onIncrement,
  onToggleFavorite,
  valueLabels,
  badgeClasses,
  isReadOnly,
  priority = false,
}: AnimeCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="card border border-secondary-subtle bg-body-tertiary shadow-sm rounded-4 anime-card bg-body text-body-secondary">
      <Link href={`/anime/${anime.id}`}>
        <div className="card-img-container position-relative w-100 h-100">
          {isReadOnly ? (
            <button
              className="btn d-flex align-items-center justify-content-center btn-outline-danger position-absolute top-0 end-0 m-2"
              style={{
                top: "10px",
                right: "10px",
                borderRadius: "50%",
                zIndex: 5,
                backgroundColor: "rgba(0,0,0,0.5)",
                border: "none",
                width: "35px",
                height: "35px",
                padding: 0,
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
              }}
              title={
                anime.favorite
                  ? "Remover dos favoritos"
                  : "Adicionar aos favoritos"
              }
            >
              <span
                style={{
                  fontSize: "1.2rem",
                  lineHeight: 1,
                  color: anime.favorite ? "#FFD700" : "#ddd",
                  marginTop: "-2px",
                }}
              >
                <Star
                  size={16}
                  color={anime.favorite ? "#FFD700" : "#fff"}
                  fill={anime.favorite ? "#FFD700" : "none"}
                />
              </span>
            </button>
          ) : (
            <button
              className="btn d-flex align-items-center justify-content-center btn-outline-danger position-absolute top-0 end-0 m-2"
              style={{
                top: "10px",
                right: "10px",
                borderRadius: "50%",
                zIndex: 10,
                backgroundColor: "rgba(0,0,0,0.5)",
                border: "none",
                width: "35px",
                height: "35px",
                padding: 0,
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
              }}
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(anime.id);
              }}
              title={
                anime.favorite
                  ? "Remover dos favoritos"
                  : "Adicionar aos favoritos"
              }
            >
              <span
                style={{
                  fontSize: "1.2rem",
                  lineHeight: 1,
                  color: anime.favorite ? "#FFD700" : "#ddd",
                  marginTop: "-2px",
                }}
              >
                <Star
                  size={16}
                  color={anime.favorite ? "#FFD700" : "#fff"}
                  fill={anime.favorite ? "#FFD700" : "none"}
                />
              </span>
            </button>
          )}
          <Image
            src={
              anime.imageUrl ||
              "https://placehold.co/400x600/EDF2F7/718096?text=Sem+Capa"
            }
            alt={anime.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="anime-poster"
            style={{ objectFit: "cover" }}
            priority={priority}
          />
        </div>
      </Link>

      <div className="card-body d-flex flex-column justify-content-between p-3">
        <div>
          <Link
            className="text-decoration-none link-body-emphasis"
            href={`/anime/${anime.id}`}
          >
            <h5
              className="text-reset card-title text-truncate mb-2 fw-bold"
              title={anime.title}
            >
              {anime.title}
            </h5>
          </Link>

          <div className="d-flex gap-2 mb-3">
            <span className="badge bg-body-secondary text-body text-capitalize">
              {valueLabels[anime.type] || anime.type || "Desconhecido"}
            </span>
            <span className="badge bg-primary d-flex justify-content-center align-items-center gap-1">
              <Star size={12} color="white" fill="currentColor" />
              {anime.score ? anime.score.toFixed(1) : "N/A"}
            </span>
          </div>
        </div>

        <div>
          <div className="d-flex flex-column small text-body-secondary mb-2">
            <span className="fw-semibold mb-1">Progresso:</span>

            <div className="d-flex justify-content-between align-items-center">
              {isReadOnly ? (
                <div className="shrink-0" style={{ width: "22px" }} />
              ) : (
                <button
                  className="btn btn-sm btn-success p-0 d-flex align-items-center justify-content-center shadow-sm"
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                  }}
                  title="Mais um episódio assistido"
                  onClick={() => onIncrement(anime.id)}
                  disabled={
                    !!anime.episodes && anime.watchedEpisodes >= anime.episodes
                  }
                >
                  <Plus size={14} />
                </button>
              )}
              <span
                className="fw-bold text-body text-truncate text-end"
                style={{ fontSize: "13px", letterSpacing: "0.5px" }}
                title={`${anime.watchedEpisodes} de ${anime.episodes || "??"}`}
              >
                {anime.watchedEpisodes} / {anime.episodes || "??"}
              </span>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div
            className="progress bg-body-secondary mb-3"
            style={{ height: "6px" }}
          >
            <div
              className="progress-bar bg-primary rounded-pill"
              role="progressbar"
              style={{
                width: anime.episodes
                  ? `${(anime.watchedEpisodes / anime.episodes) * 100}%`
                  : "0%",
              }}
            ></div>
          </div>

          {/* Status e Comentários */}
          <div
            className="pt-2 border-top d-flex justify-content-between align-items-center text-uppercase position-relative gap-2"
            style={{ borderColor: "rgba(0,0,0,0.05)" }}
          >
            <small className="text-body-secondary text-capitalize fw-semibold d-none d-sm-inline">
              Status:
            </small>
            <span
              className={`badge text-truncate ${badgeClasses[anime.status] || "bg-secondary text-body"}`}
              style={{ maxWidth: "100%" }}
              title={
                valueLabels[anime.status] || anime.status || "Desconhecido"
              }
            >
              {valueLabels[anime.status] || anime.status || "Desconhecido"}
            </span>

            {isReadOnly && anime.comments && anime.comments.trim() !== "" && (
              <div className="shrink-0">
                <button
                  className="btn btn-sm p-0 text-primary"
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsHovering(true);
                  }}
                >
                  <MessageSquare fill="currentColor" size={20} />
                </button>

                {/* modal */}
                {isHovering && (
                  <>
                    {/* Fundo escurecido */}
                    <div
                      className="position-fixed top-0 start-0 w-100 h-100"
                      style={{
                        zIndex: 1040,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(2px)",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsHovering(false);
                      }}
                    />

                    {/* Caixa de Anotações que nunca sai da tela */}
                    <div
                      className="bg-body border border-secondary-subtle shadow-lg rounded-4 p-4 text-body text-start"
                      style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "85%",
                        maxWidth: "350px",
                        zIndex: 1050,
                        textTransform: "none",
                      }}
                    >
                      {/* Cabeçalho do Pop-up com botão de fechar */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6
                          className="fw-bold m-0 text-primary"
                          style={{ fontSize: "16px" }}
                        >
                          Anotações Pessoais
                        </h6>
                        <button
                          className="btn-close"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsHovering(false);
                          }}
                        ></button>
                      </div>

                      {/* O texto do comentário */}
                      <p
                        className="m-0 text-body-secondary"
                        style={{
                          fontSize: "14px",
                          whiteSpace: "pre-wrap",
                          lineHeight: "1.5",
                          maxHeight: "60vh",
                          overflowY: "auto",
                        }}
                      >
                        {anime.comments}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
