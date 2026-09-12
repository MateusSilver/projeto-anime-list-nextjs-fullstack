import type { Metadata } from "next";
import UserProfileClient from "./userProfileClient";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Try/catch caso o backend falhe, evitando quebrar a página toda
  try {
    const res = await fetch(
      `https://projeto-anime-list.onrender.com/api/users/${params.id}`,
    );
    const user = await res.json();

    return {
      title: `Perfil de ${user.name}`,
      description: `Veja o perfil público e as estatísticas de ${user.name}.`,
      alternates: {
        canonical: `/user/${params.id}`,
      },
    };
  } catch (error) {
    return { title: "Perfil de Usuário" };
  }
}

export default function UserProfilePage({ params }: Props) {
  // Passando o params inteiro para o client component
  return <UserProfileClient params={params} />;
}
