import type { Metadata } from "next";
import UsersClient from "./usersClient";

export const metadata: Metadata = {
  title: "Comunidade",
  description:
    "Encontre outros usuários, explore listas públicas e descubra novos animes recomendados pela comunidade.",
  alternates: {
    canonical: "/users",
  },
};

export default function UsersPage() {
  return <UsersClient />;
}
