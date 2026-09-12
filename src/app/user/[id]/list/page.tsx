import type { Metadata } from "next";
import UserListClient from "./userListClient";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `https://projeto-anime-list.onrender.com/api/users/${params.id}`,
    );
    const user = await res.json();

    return {
      title: `Lista de ${user.name}`,
      description: `Confira os animes concluídos e as avaliações na lista pública de ${user.name}.`,
      alternates: {
        canonical: `/user/${params.id}/list`,
      },
      openGraph: {
        title: `Lista de Animes de ${user.name}`,
        description: `Veja os detalhes e avaliações do catálogo de ${user.name}.`,
        url: `/user/${params.id}/list`,
      },
    };
  } catch (error) {
    return { title: "Lista de Animes" };
  }
}

export default function UserListPage({ params }: Props) {
  return <UserListClient params={params} />;
}
