"use client";
import { ArrowLeft, Mail, StarIcon, List, Loader2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserProfile } from "@/types/user";
import type { Metadata } from "next";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await fetch(
    `https://projeto-anime-list.onrender.com/api/users/${params.id}`,
  );
  const user = await res.json();

  return {
    title: `Usuário ${user.name}`,
    description: `Confira o perfil de ${user.name}.`,
    openGraph: {
      title: `Usuário ${user.name}`,
      description: `Veja os dados de ${user.name}.`,
      url: `/user/${params.id}`,
      images: [
        {
          url: user.profileImageUrl || "https://placehold.co/150x150?text=User",
        },
      ],
    },
  };
}

export default function PublicProfilePage({ params }: Props) {
  const userId = params.id;

  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetch(`${apiUrl}/api/users/${userId}/public-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Dados recebidos do Java:", data);
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router, userId]);

  useEffect(() => {
    const loadProfile = async () => {
      await fetchProfile();
    };
    loadProfile();
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center mt-5 pt-5 text-body-secondary">
        <Loader2 size={48} className="icon-spin text-primary mb-3" />
        <h5 className="fw-semibold">Carregando perfil...</h5>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container py-5 text-center mt-5">
        <div
          className="alert bg-body-tertiary border shadow-sm d-inline-block p-4 rounded-4"
          role="alert"
        >
          <h5 className="text-danger fw-bold mb-2">
            Não foi possível carregar os dados.
          </h5>
          <p className="text-body-secondary mb-4 small">
            O utilizador pode não existir ou o perfil é privado.
          </p>
          <Link
            href="/users"
            className="btn btn-primary text-light d-inline-flex align-items-center gap-2 rounded-pill px-4"
          >
            <ArrowLeft size={16} /> Voltar à Comunidade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="container py-5 mt-4 mt-md-5">
      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary-subtle pb-3 flex-wrap gap-3">
        <h1 className="fw-bold m-0 text-truncate">
          Perfil de <span className="text-primary">{userProfile.name}</span>
        </h1>
        <Link
          href="/users"
          className="d-flex align-items-center text-decoration-none text-body gap-2 fw-semibold"
        >
          <ArrowLeft size={18} />
          Voltar à Comunidade
        </Link>
      </div>

      <div className="row g-4">
        {/* COLUNA ESQUERDA: Exibição da Foto e Botão */}
        <div className="col-12 col-lg-4">
          <div className="card border border-secondary-subtle bg-body-tertiary shadow-sm rounded-4 p-4 text-center mb-3">
            <div
              style={{ position: "relative", width: "50px", height: "50px" }}
            >
              <Image
                src={
                  userProfile.profileImageUrl ||
                  "https://placehold.co/150x150?text=User"
                }
                alt={`Avatar de ${userProfile.name}`}
                fill
                sizes="50px"
                className="rounded-circle"
                style={{ objectFit: "cover" }}
              />
            </div>
            <h4 className="fw-bold m-0 text-body mb-1">{userProfile.name}</h4>
            <p className="text-muted small m-0 d-flex justify-content-center align-items-center gap-1">
              <Mail size={14} /> {userProfile.email}
            </p>
          </div>

          <Link
            className="text-decoration-none d-grid"
            href={`/user/${userId}/list`}
          >
            <button className="btn btn-primary fw-semibold rounded-md p-2 d-flex justify-content-center align-items-center gap-2 shadow-sm hover-scale">
              <List size={20} />
              Ver Acervo Público
            </button>
          </Link>
        </div>

        {/* COLUNA DIREITA: Estatísticas e Favoritos */}
        <div className="col-12 col-lg-8">
          {/* PAINEL DE ESTATÍSTICAS */}
          <div className="bg-body border border-secondary-subtle rounded-4 overflow-hidden mb-4 shadow-sm">
            {/* 3. Tabela Responsiva */}
            <div className="table-responsive">
              <table className="table m-0 border-0 text-nowrap">
                <tbody>
                  <tr>
                    <td className="p-3 border-bottom border-secondary-subtle text-body-secondary fw-medium">
                      Total no Acervo
                    </td>
                    <td className="p-3 border-bottom border-secondary-subtle fw-bold text-end text-primary fs-5">
                      {userProfile.totalAnimes
                        ? userProfile.totalAnimes.toLocaleString("pt-BR")
                        : 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border-bottom border-secondary-subtle text-body-secondary fw-medium">
                      Completos
                    </td>
                    <td className="p-3 border-bottom border-secondary-subtle fw-bold text-end">
                      {userProfile.completed
                        ? userProfile.completed.toLocaleString("pt-BR")
                        : 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border-bottom border-secondary-subtle text-body-secondary fw-medium">
                      Assistindo
                    </td>
                    <td className="p-3 border-bottom border-secondary-subtle fw-bold text-end">
                      {userProfile.watching
                        ? userProfile.watching.toLocaleString("pt-BR")
                        : 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border-bottom border-secondary-subtle text-body-secondary fw-medium">
                      Pausados
                    </td>
                    <td className="p-3 border-bottom border-secondary-subtle fw-bold text-end">
                      {userProfile.onHold
                        ? userProfile.onHold.toLocaleString("pt-BR")
                        : 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border-bottom border-secondary-subtle text-body-secondary fw-medium">
                      Abandonados
                    </td>
                    <td className="p-3 border-bottom border-secondary-subtle fw-bold text-end">
                      {userProfile.dropped
                        ? userProfile.dropped.toLocaleString("pt-BR")
                        : 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-body-secondary fw-medium bg-body-tertiary">
                      Total de Episódios Assistidos
                    </td>
                    <td className="p-3 fw-bold text-end bg-body-tertiary">
                      {userProfile.totalEpisodesWatched
                        ? userProfile.totalEpisodesWatched.toLocaleString(
                            "pt-BR",
                          )
                        : 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PAINEL DE FAVORITOS */}
          <h5 className="fw-bold mb-3 border-bottom border-secondary-subtle pb-2 d-flex align-items-center gap-2">
            <StarIcon size={22} className="text-warning" fill="currentColor" />
            Favoritos (
            {userProfile.favoriteAnimes?.length
              ? userProfile.favoriteAnimes.length.toLocaleString("pt-BR")
              : 0}
            )
          </h5>

          {!userProfile.favoriteAnimes ||
          userProfile.favoriteAnimes.length === 0 ? (
            <div className="bg-body-tertiary p-5 rounded-4 text-center border border-dashed border-secondary-subtle">
              <StarIcon size={40} className="text-muted mb-2 opacity-50" />
              <p className="text-muted m-0 fw-semibold">
                Nenhum anime favoritado ainda.
              </p>
            </div>
          ) : (
            <div className="row g-3">
              {userProfile.favoriteAnimes.map((anime) => (
                <div
                  className="col-6 col-sm-4 col-md-3 col-lg-2"
                  key={anime.id}
                >
                  <Link
                    href={`/anime/${anime.id}`}
                    className="text-decoration-none"
                  >
                    <div
                      className="card border border-secondary-subtle bg-body shadow-sm rounded-4 h-100 text-center overflow-hidden hover-scale"
                      style={{ transition: "transform 0.2s" }}
                    >
                      <Image
                        src={
                          anime.imageUrl ||
                          "https://placehold.co/200x300?text=Capa"
                        }
                        alt={anime.title}
                        className="card-img-top"
                        style={{ height: "140px", objectFit: "cover" }}
                      />
                      <div className="card-body p-2 d-flex align-items-center justify-content-center bg-body-tertiary">
                        <small
                          className="fw-bold text-body text-truncate d-block w-100"
                          style={{ fontSize: "12px" }}
                          title={anime.title}
                        >
                          {anime.title}
                        </small>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
