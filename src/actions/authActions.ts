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

  const token = await new SignJWT({
    userId: user.id,
    name: user.name,
    profileImageUrl: user.profileImageUrl,
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
    return payload as {
      userId: number;
      name: string;
      profileImageUrl?: string;
    };
  } catch (error) {
    return null;
  }
}

export async function registerAction(formData: {
  name: string;
  email: string;
  password: string;
  profileImageUrl?: string;
}) {
  const { name, email, password, profileImageUrl } = formData;

  const emailExistente = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (emailExistente.length > 0) {
    throw new Error("Email já está em uso.");
  }
  const hashPassword = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashPassword,
      profileImageUrl:
        profileImageUrl || "https://placehold.co/150x150/png?text=User",
    })
    .returning();

  const token = await new SignJWT({
    userId: newUser.id,
    name: newUser.name,
    profileImageUrl: newUser.profileImageUrl,
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
  return { sucess: true };
}
