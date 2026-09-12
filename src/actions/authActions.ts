"use server";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "chave_padrao_desenvolvimento",
);

export async function loginAction(email: string, passwordDigitada: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.password) {
    throw new Error("Credenciais inválidas");
  }

  const senhaValida = await bcrypt.compare(passwordDigitada, user.password);

  if (!senhaValida) {
    throw new Error("Credenciais inválidas");
  }

  const token = await new SignJWT({ userId: user.id, name: user.name })
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

  return { success: true, name: user.name };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { userId: number; name: string };
  } catch (error) {
    return null;
  }
}
