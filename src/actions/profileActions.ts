"use server";

import { db } from "@/db";
import { users, animes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "./authActions";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "chave_padrao_desenvolvimento",
);

export async function getProfileDataAction() {
  const session = await getSessionUser();
  if (!session) throw new Error("Não autorizado");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  if (!user) throw new Error("Usuário não encontrado");

  const userAnimes = await db
    .select()
    .from(animes)
    .where(eq(animes.userId, session.userId));

  const stats = {
    totalAnimes: userAnimes.length,
    totalEpisodes: 0,
    averageScore: "0.00",
    statusCount: {
      Watching: 0,
      Completed: 0,
      "On Hold": 0,
      Dropped: 0,
      "Plan to Watch": 0,
    } as Record<string, number>,
    typeCount: {} as Record<string, number>,
  };

  let sumScore = 0;
  let scoreCount = 0;
  const favoriteAnimes: typeof userAnimes = [];

  userAnimes.forEach((anime) => {
    stats.totalEpisodes += anime.watchedEpisodes || 0;

    const score = Number(anime.score);
    if (score > 0) {
      sumScore += score;
      scoreCount++;
    }

    const status = anime.status || "Plan to Watch";
    stats.statusCount[status] = (stats.statusCount[status] || 0) + 1;

    const type = anime.type || "TV";
    stats.typeCount[type] = (stats.typeCount[type] || 0) + 1;

    if (anime.isFavorite) {
      favoriteAnimes.push({ ...anime, isFavorite: true });
    }
  });

  if (scoreCount > 0) {
    stats.averageScore = (sumScore / scoreCount).toFixed(2);
  }

  return {
    name: user.name,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    stats,
    favoriteAnimes,
  };
}

export async function updateProfileAction(data: {
  name: string;
  profileImageUrl: string;
  password?: string;
}) {
  const session = await getSessionUser();
  if (!session) throw new Error("Não autorizado");

  const updateData: {
    name: string;
    profileImageUrl: string;
    password?: string;
  } = {
    name: data.name,
    profileImageUrl: data.profileImageUrl,
  };

  if (data.password && data.password.trim() !== "") {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const [updatedUser] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, session.userId))
    .returning();

  const token = await new SignJWT({
    userId: updatedUser.id,
    name: updatedUser.name,
    profileImageUrl: updatedUser.profileImageUrl,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true, message: "Perfil atualizado com sucesso!" };
}
